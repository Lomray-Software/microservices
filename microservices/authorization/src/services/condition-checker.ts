import { Log } from '@lomray/microservice-helpers';
import type { AbstractMicroservice } from '@lomray/microservice-nodejs-lib';
import type { IJsonQuery } from '@lomray/microservices-types';
import { JQJunction } from '@lomray/microservices-types';
import Templater from '@services/templater';

interface IConditionRequest {
  isParallel?: boolean;
  // lodash template
  method: string;
  // can include lodash template

  params?: {
    query?: IJsonQuery;
  };
}

interface IConditionalSwitchRequest {
  switch: {
    value: string;
    cases: {
      [key: string]: IConditionRequest;
    };
  };
}

export interface ICondition {
  requests?: {
    [key: string]: IConditionRequest | IConditionalSwitchRequest;
  };
  // lodash template
  template: string;
}

export type IConditions =
  | {
      [JQJunction.and]?: IConditions[];
    }
  | {
      [JQJunction.or]?: IConditions[];
    }
  | ICondition;

/**
 * Check json condition
 */
class ConditionChecker {
  /**
   * @private
   */
  private templateParams: Record<string, any>;

  /**
   * @private
   */
  private readonly ms: AbstractMicroservice;

  /**
   * @constructor
   */
  constructor(ms: ConditionChecker['ms'], templateParams: Record<string, any> = {}) {
    this.ms = ms;
    this.templateParams = templateParams;
  }

  /**
   * Exec microservice request
   * @private
   */
  private async execRequest(key: string, { params, method }: IConditionRequest): Promise<void> {
    const msMethod = Templater.compile(method, this.templateParams);
    const data = params
      ? Templater.compile(params, { ...this.templateParams, method: msMethod })
      : {};
    let response;

    try {
      if (method) {
        response = await this.ms.sendRequest(msMethod, data);
      } else {
        Log.error('Condition request failed (#3): Empty switch case');
      }
    } catch (e) {
      Log.error('Condition request failed (#1): ', e);
    } finally {
      if (response?.getError()) {
        Log.error('Condition request failed (#2): ', response.getError());
      }

      this.templateParams[key] = response?.getResult() ?? null;
    }
  }

  /**
   * Exec condition requests
   * @private
   */
  private async execRequests(requests: ICondition['requests'] = {}): Promise<void> {
    const parallelRequest = [];

    for (const [key, request] of Object.entries(requests)) {
      let requestParams: IConditionRequest;

      if ('switch' in request) {
        const { value, cases } = request.switch;
        const compiledValue = Templater.compile(value, this.templateParams);
        const compiledCases = Object.entries(cases).reduce(
          (res, [caseKey, caseValue]) => ({
            ...res,
            [Templater.compile(caseKey, this.templateParams)]: caseValue,
          }),
          {},
        );

        requestParams = compiledCases[compiledValue];
      } else {
        requestParams = request;
      }

      const req = this.execRequest(key, requestParams ?? {});

      if (!requestParams?.isParallel) {
        await req;
      } else {
        parallelRequest.push(req);
      }
    }

    await Promise.all(parallelRequest);
  }

  /**
   * Exec template condition
   * @private
   */
  private async execCondition(condition: ICondition): Promise<boolean> {
    const { requests, template } = condition;

    if (requests) {
      await this.execRequests(requests);
    }

    return Templater.compile(template, this.templateParams) === 'true';
  }

  /**
   * Map junction conditions
   * @private
   */
  private async mapConditions(operator: JQJunction, conditions: IConditions[]): Promise<boolean> {
    let isAllow = false;

    for (const condition of conditions) {
      isAllow = await this.execConditions(condition);

      // return result immediately, skip other conditions in this part
      if (isAllow && operator === JQJunction.or) {
        return isAllow;
      }
    }

    return isAllow;
  }

  /**
   * Parse conditions and exec
   */
  public async execConditions(conditions?: IConditions): Promise<boolean> {
    let isAllow = false;

    if (!conditions) {
      return isAllow;
    }

    for (const [operator, condition] of Object.entries(conditions)) {
      switch (operator) {
        case JQJunction.and:
        case JQJunction.or:
          isAllow = await this.mapConditions(operator, condition as IConditions[]);
          break;

        default:
          return this.execCondition(conditions as ICondition);
      }
    }

    return isAllow;
  }

  /**
   * Add template params
   */
  public addTemplateParams(params: Record<string, any>): void {
    this.templateParams = {
      ...this.templateParams,
      ...params,
    };
  }
}

export default ConditionChecker;

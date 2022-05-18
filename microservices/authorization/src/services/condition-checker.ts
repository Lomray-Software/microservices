import { Log } from '@lomray/microservice-helpers';
import type { AbstractMicroservice } from '@lomray/microservice-nodejs-lib';
import type { IJsonQuery } from '@lomray/typeorm-json-query';
import { IJsonQueryJunction } from '@lomray/typeorm-json-query';
import _ from 'lodash';

interface IConditionRequest {
  isParallel?: boolean;
  // lodash template
  method: string;
  // can include lodash template
  query?: IJsonQuery;
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
      [IJsonQueryJunction.and]?: IConditions[];
    }
  | {
      [IJsonQueryJunction.or]?: IConditions[];
    }
  | ICondition;

/**
 * Check json condition
 */
class ConditionChecker {
  /**
   * @private
   */
  private readonly templateParams: Record<string, any>;

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
  private async execRequest(key: string, { query, method }: IConditionRequest): Promise<void> {
    const msMethod = _.template(method)({ ...this.templateParams });
    const data = query ? JSON.parse(_.template(JSON.stringify(query))(this.templateParams)) : {};
    const response = await this.ms.sendRequest(msMethod, data);

    if (!response.getError()) {
      this.templateParams[key] = response.getResult();
    } else {
      this.templateParams[key] = null;
    }

    Log.error('Condition request failed: ', response.getError());
  }

  /**
   * Exec condition requests
   * @private
   */
  private async execRequests(requests: ICondition['requests'] = {}): Promise<void> {
    const parallelRequest = [];

    for (const [key, request] of Object.entries(requests)) {
      let requestParams;

      if ('switch' in request) {
        const { value, cases } = request.switch;
        const compiledValue = _.template(value)(this.templateParams);

        requestParams = cases[compiledValue];
      } else {
        requestParams = request;
      }

      const req = this.execRequest(key, requestParams);

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

    return _.template(template)(this.templateParams) === 'true';
  }

  /**
   * Map junction conditions
   * @private
   */
  private async mapConditions(
    operator: IJsonQueryJunction,
    conditions: IConditions[],
  ): Promise<boolean> {
    let isAllow = false;

    for (const condition of conditions) {
      isAllow = await this.execConditions(condition);

      // return result immediately, skip other conditions in this part
      if (isAllow && operator === IJsonQueryJunction.or) {
        return isAllow;
      }
    }

    return isAllow;
  }

  /**
   * Parse conditions and exec
   */
  public async execConditions(conditions: IConditions): Promise<boolean> {
    let isAllow = false;

    for (const [operator, condition] of Object.entries(conditions)) {
      switch (operator) {
        case IJsonQueryJunction.and:
        case IJsonQueryJunction.or:
          isAllow = await this.mapConditions(operator, condition);
          break;

        default:
          return this.execCondition(conditions as ICondition);
      }
    }

    return isAllow;
  }
}

export default ConditionChecker;

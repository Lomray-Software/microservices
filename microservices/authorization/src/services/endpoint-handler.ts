import type { IJsonQuery } from '@lomray/typeorm-json-query';
import { getRepository } from 'typeorm';
import { FilterType } from '@constants/filter';
import { MS_DEFAULT_ROLE_ALIAS } from '@constants/index';
import Method from '@entities/method';
import Model from '@entities/model';
import RolesTree from '@entities/roles-tree';
import UserRole from '@entities/user-role';
import Enforcer from '@services/enforcer';
import FieldsFilter from '@services/fields-filter';
import MethodFilters from '@services/method-filters';

export interface IEndpointHandlerParams {
  hasFilters: boolean;
  hasFilterInput: boolean;
  hasFilterOutput: boolean;
  userId?: string | null;
}

class EndpointHandler {
  /**
   * @private
   */
  private readonly microservice: string;

  /**
   * @private
   */
  private readonly methodName: string;

  /**
   * @private
   */
  private readonly params: IEndpointHandlerParams;

  /**
   * @private
   */
  private method?: Method | null = null;

  /**
   * @private
   */
  private enforcer?: Enforcer;

  /**
   * @constructor
   * @protected
   */
  protected constructor(microservice: string, methodName: string, params: IEndpointHandlerParams) {
    this.microservice = microservice;
    this.methodName = methodName;
    this.params = params;
  }

  /**
   * Init service
   */
  static init(methodName: string, params: IEndpointHandlerParams): EndpointHandler {
    const [microservice, ...methodParts] = methodName.split('.');

    return new EndpointHandler(microservice, methodParts.join('.'), params);
  }

  /**
   * Check if method name allowed for user
   */
  public async isMethodAllowed(shouldThrowError: boolean): Promise<boolean> {
    return this.getEnforcer().enforce(await this.getMethod(), shouldThrowError);
  }

  /**
   * Return typeorm query filters for method
   */
  public async getMethodFilters(reqParams: Record<string, any> = {}): Promise<IJsonQuery> {
    const { roles } = await this.getEnforcer().findUserRoles();

    const filters = MethodFilters.init({
      userRoles: roles,
      templateOptions: { userId: this.params.userId, fields: reqParams },
    }).getFilters((await this.getMethod())?.methodFilters ?? []);

    return { where: filters };
  }

  /**
   * Filter fields (in/put)
   */
  public async filterFields(
    type: FilterType,
    fields?: Record<string, any>,
    templateOptions?: Record<string, any>,
  ): Promise<Record<string, any> | undefined> {
    const [{ roles }, method] = await Promise.all([
      this.getEnforcer().findUserRoles(),
      this.getMethod(),
    ]);

    return FieldsFilter.init({
      userId: this.params.userId,
      userRoles: roles,
      templateOptions,
      modelRepository: getRepository(Model),
    }).filter(type, type === FilterType.IN ? method?.modelIn : method?.modelOut, fields);
  }

  /**
   * Get method enforcer
   * @private
   */
  public getEnforcer(): Enforcer {
    if (this.enforcer) {
      return this.enforcer;
    }

    this.enforcer = Enforcer.init({
      userId: this.params.userId,
      defaultRole: MS_DEFAULT_ROLE_ALIAS,
      userRoleRepository: getRepository(UserRole),
      rolesTreeRepository: getRepository(RolesTree),
    });

    return this.enforcer;
  }

  /**
   * Get method
   * @private
   */
  private async getMethod(): Promise<Method | undefined> {
    if (this.method !== null) {
      return this.method;
    }

    const { hasFilters, hasFilterInput, hasFilterOutput } = this.params;

    this.method = await getRepository(Method).findOne(
      {
        microservice: this.microservice,
        method: this.methodName,
      },
      {
        relations: [
          ...(hasFilters ? ['methodFilters', 'methodFilters.filter'] : []),
          ...(hasFilterInput ? ['modelIn'] : []),
          ...(hasFilterOutput ? ['modelOut'] : []),
        ],
      },
    );

    return this.method;
  }
}

export default EndpointHandler;

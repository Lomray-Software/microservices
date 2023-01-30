import { RemoteConfig } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import _ from 'lodash';
import { Repository } from 'typeorm';
import ExceptionCode from '@constants/exception-code';
import CONST from '@constants/index';
import Method from '@entities/method';
import RolesTree from '@entities/roles-tree';
import UserRole from '@entities/user-role';
import { IRemoteConfig } from '@interfaces/remote-config';
import type ConditionChecker from '@services/condition-checker';

export interface IEnforcerParams {
  userId?: string | null;
  userRoleRepository: Repository<UserRole>;
  rolesTreeRepository: Repository<RolesTree>;
  conditionChecker?: ConditionChecker;
}

/**
 * Check access user to microservice method.
 */
class Enforcer {
  /**
   * @private
   */
  private readonly userId: IEnforcerParams['userId'];

  /**
   * @private
   */
  private readonly userRoleRepository: IEnforcerParams['userRoleRepository'];

  /**
   * @private
   */
  private readonly rolesTreeRepository: IEnforcerParams['rolesTreeRepository'];

  /**
   * @private
   */
  private readonly conditionChecker: IEnforcerParams['conditionChecker'];

  /**
   * @private
   */
  private userInfo?: { userId: IEnforcerParams['userId']; roles: string[] };

  /**
   * @constructor
   * @protected
   */
  protected constructor({
    userId,
    userRoleRepository,
    rolesTreeRepository,
    conditionChecker,
  }: IEnforcerParams) {
    this.userId = userId;
    this.userRoleRepository = userRoleRepository;
    this.rolesTreeRepository = rolesTreeRepository;
    this.conditionChecker = conditionChecker;
  }

  /**
   * Init service
   */
  public static init(params: IEnforcerParams): Enforcer {
    return new Enforcer(params);
  }

  /**
   * Check access user to microservice method.
   */
  public async enforce(method?: Method, shouldThrowError = true): Promise<boolean> {
    if (!method) {
      return Enforcer.enforceResponse(false, shouldThrowError, this.userId);
    }

    const { denyGroup, allowGroup, condition } = method;
    const { userId, roles } = await this.findUserRoles();
    const userGroups = [userId, ...roles];

    const isAllow = Enforcer.enforceResponse(
      _.intersection(denyGroup, userGroups).length === 0 &&
        _.intersection(allowGroup, userGroups).length > 0,
      shouldThrowError,
      this.userId,
    );

    if (!condition) {
      return isAllow;
    }

    this.conditionChecker?.addTemplateParams({ roles });

    return Enforcer.enforceResponse(
      (await this.conditionChecker?.execConditions(condition.conditions)) ?? false,
      shouldThrowError,
      this.userId,
    );
  }

  /**
   * Return enforce response
   * @private
   */
  private static enforceResponse(
    isAllow: boolean,
    shouldThrowError: boolean,
    userId?: string | null,
  ): boolean {
    if (!shouldThrowError || isAllow) {
      return isAllow;
    }

    throw new BaseException({
      code: ExceptionCode.METHOD_NOT_ALLOWED,
      status: 405,
      message: 'Method not allowed.',
      payload: { userId },
    });
  }

  /**
   * Get default user role
   * @private
   */
  private async getDefaultUserRole(): Promise<string> {
    const config = await RemoteConfig.get<IRemoteConfig>('config');

    return config?.defaultRole ?? CONST.MS_DEFAULT_ROLE_ALIAS;
  }

  /**
   * Find user roles
   */
  public async findUserRoles(): Promise<NonNullable<Enforcer['userInfo']>> {
    if (this.userInfo) {
      return this.userInfo;
    }

    if (!this.userId) {
      this.userInfo = { userId: this.userId, roles: ['guest'] };

      return this.userInfo;
    }

    const { userId, roleAlias } = (await this.userRoleRepository.findOne({
      userId: this.userId,
    })) ?? { userId: this.userId, roleAlias: await this.getDefaultUserRole() };
    const { path } = (await this.rolesTreeRepository.findOne({ alias: roleAlias })) ?? {};

    this.userInfo = { userId, roles: path ?? [roleAlias] };

    return this.userInfo;
  }
}

export default Enforcer;

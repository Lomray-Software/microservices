import { BaseException } from '@lomray/microservice-nodejs-lib';
import _ from 'lodash';
import { Repository } from 'typeorm';
import ExceptionCode from '@constants/exception-code';
import Method from '@entities/method';
import RolesTree from '@entities/roles-tree';
import UserRole from '@entities/user-role';

export interface IEnforcerParams {
  userId?: string;
  defaultRole: string;
  userRoleRepository: Repository<UserRole>;
  rolesTreeRepository: Repository<RolesTree>;
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
  private readonly defaultRole: IEnforcerParams['defaultRole'];

  /**
   * @private
   */
  private readonly userRoleRepository: IEnforcerParams['userRoleRepository'];

  /**
   * @private
   */
  private rolesTreeRepository: IEnforcerParams['rolesTreeRepository'];

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
    defaultRole,
    userRoleRepository,
    rolesTreeRepository,
  }: IEnforcerParams) {
    this.userId = userId;
    this.defaultRole = defaultRole;
    this.userRoleRepository = userRoleRepository;
    this.rolesTreeRepository = rolesTreeRepository;
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
      return Enforcer.enforceResponse(false, shouldThrowError);
    }

    const { denyGroup, allowGroup } = method;
    const { userId, roles } = await this.findUserRoles();
    const userGroups = [userId, ...roles];

    return Enforcer.enforceResponse(
      _.intersection(denyGroup, userGroups).length === 0 &&
        _.intersection(allowGroup, userGroups).length > 0,
      shouldThrowError,
    );
  }

  /**
   * Return enforce response
   * @private
   */
  private static enforceResponse(isAllow: boolean, shouldThrowError: boolean): boolean {
    if (!shouldThrowError || isAllow) {
      return isAllow;
    }

    throw new BaseException({
      code: ExceptionCode.METHOD_NOT_ALLOWED,
      status: 405,
      message: 'Method not allowed.',
    });
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
    })) ?? { userId: this.userId, roleAlias: this.defaultRole };
    const { parents } = (await this.rolesTreeRepository.findOne({ alias: roleAlias })) ?? {};

    this.userInfo = { userId, roles: parents ?? [roleAlias] };

    return this.userInfo;
  }
}

export default Enforcer;

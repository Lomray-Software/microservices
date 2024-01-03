import { EntityColumns } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import ExceptionCode from '@constants/exception-code';
import User from '@entities/user';
import UserRepository from '@repositories/user';
import { ConfirmBy } from '@services/confirm/factory';

export type ChangePasswordParams = {
  userId?: string;
  login?: string;
  confirmBy?: ConfirmBy;
  repository: UserRepository;
  isConfirmed?: (user: User) => Promise<boolean> | boolean | undefined;
};

/**
 * Change user password
 */
class ChangePassword {
  /**
   * @protected
   */
  protected readonly userId?: string;

  /**
   * @protected
   */
  protected readonly login?: string;

  /**
   * @protected
   */
  protected readonly confirmBy?: ConfirmBy;

  /**
   * @protected
   */
  protected readonly isConfirmed?: ChangePasswordParams['isConfirmed'];

  /**
   * @protected
   */
  protected readonly repository: ChangePasswordParams['repository'];

  /**
   * @constructor
   */
  protected constructor({
    userId,
    login,
    confirmBy,
    repository,
    isConfirmed,
  }: ChangePasswordParams) {
    this.userId = userId;
    this.login = login;
    this.confirmBy = confirmBy;
    this.isConfirmed = isConfirmed;
    this.repository = repository;
  }

  /**
   * Init service
   */
  static init(params: ChangePasswordParams): ChangePassword {
    return new ChangePassword(params);
  }

  /**
   * Change password
   */
  public async change(newPassword: string, oldPassword?: string): Promise<User> {
    const user = await this.repository.findOne(
      { ...(this.userId ? { id: this.userId } : { [this.confirmBy as string]: this.login }) },
      { select: EntityColumns(this.repository) },
    );

    if (!user) {
      throw new BaseException({
        status: 404,
        message: 'User not found.',
      });
    }

    /**
     * Verify if user was frozen
     */
    if (user.isFrozen) {
      throw new BaseException({
        code: ExceptionCode.ACCOUNT_FROZEN,
        message: 'Account was frozen.',
        status: 500,
      });
    }

    if (!oldPassword && !this.isConfirmed) {
      throw new BaseException({
        status: 422,
        message: 'Either of confirm methods should be provided.',
      });
    }

    if (oldPassword && !this.repository.isValidPassword(user, oldPassword)) {
      throw new BaseException({
        status: 422,
        message: 'Invalid old password.',
      });
    }

    if (this.isConfirmed && (await this.isConfirmed(user)) === false) {
      throw new BaseException({
        status: 422,
        message: 'Invalid confirmation code.',
      });
    }

    user.password = newPassword;

    await this.repository.encryptPassword(user);

    return this.repository.save(user);
  }
}

export default ChangePassword;

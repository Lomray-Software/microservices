import { EntityColumns } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import remoteConfig from '@config/remote';
import User from '@entities/user';
import type TClearUserTokens from '@interfaces/clear-user-tokens';
import UserRepository from '@repositories/user';
import { ConfirmBy } from '@services/confirm/factory';

export type ChangePasswordParams = {
  userId?: string;
  login?: string;
  confirmBy?: ConfirmBy;
  repository: UserRepository;
  isConfirmed?: (user: User) => Promise<boolean> | boolean | undefined;
  currentToken?: string;
  clearTokensType?: TClearUserTokens;
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
  protected readonly currentToken?: string;

  /**
   * @protected
   */
  protected readonly clearTokensType?: TClearUserTokens;

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
    currentToken,
    clearTokensType,
  }: ChangePasswordParams) {
    this.userId = userId;
    this.login = login;
    this.confirmBy = confirmBy;
    this.isConfirmed = isConfirmed;
    this.repository = repository;
    this.currentToken = currentToken;
    this.clearTokensType = clearTokensType;
  }

  /**
   * Init service
   */
  public static init(params: ChangePasswordParams): ChangePassword {
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

    await Promise.all([this.repository.encryptPassword(user), this.handleClearUserTokens(user.id)]);

    return this.repository.save(user);
  }

  /**
   * Handle clear user tokens
   */
  private async handleClearUserTokens(userId: string): Promise<void> {
    // Check default clear tokens type
    const { changePasswordClearTokensType } = await remoteConfig();

    const type = this.clearTokensType || changePasswordClearTokensType;

    if (!type || type === 'none') {
      return;
    }

    if (type === 'all') {
      await this.repository.clearUserTokens(userId);

      return;
    }

    // Clear tokens type - REST. Keep only current
    if (!this.currentToken) {
      throw new BaseException({
        status: 500,
        message: 'Failed to clear rest user tokens. Current user token was not found.',
      });
    }

    await this.repository.clearUserTokens(userId, this.currentToken);
  }
}

export default ChangePassword;

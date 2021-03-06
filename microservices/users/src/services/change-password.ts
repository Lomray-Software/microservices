import { BaseException } from '@lomray/microservice-nodejs-lib';
import User from '@entities/user';
import UserRepository from '@repositories/user';

type ChangePasswordThroughConfirmation = {
  isConfirmed: (user: User) => Promise<boolean> | boolean;
};

export type ChangePasswordParams = {
  userId: string;
  newPassword: string;
  repository: UserRepository;
} & ({ oldPassword: string } | ChangePasswordThroughConfirmation);

/**
 * Change user password
 */
class ChangePassword {
  /**
   * @private
   */
  private readonly userId: string;

  /**
   * @private
   */
  private readonly newPassword: string;

  /**
   * @private
   */
  private readonly oldPassword?: string;

  /**
   * @private
   */
  private readonly isConfirmed?: ChangePasswordThroughConfirmation['isConfirmed'];

  /**
   * @private
   */
  private readonly repository: ChangePasswordParams['repository'];

  /**
   * @constructor
   */
  protected constructor(params: ChangePasswordParams) {
    this.userId = params.userId;
    this.newPassword = params.newPassword;
    this.repository = params.repository;
    this.oldPassword = ('oldPassword' in params && params.oldPassword) || undefined;
    this.isConfirmed = ('isConfirmed' in params && params.isConfirmed) || undefined;
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
  public async change(): Promise<User> {
    const user = await this.repository.findOne({ id: this.userId });

    if (!user) {
      throw new BaseException({
        status: 404,
        message: 'User not found.',
      });
    }

    if (!this.oldPassword && !this.isConfirmed) {
      throw new BaseException({
        status: 422,
        message: 'Either of confirm methods should be provided.',
      });
    }

    if (this.oldPassword && !this.repository.isValidPassword(user, this.oldPassword)) {
      throw new BaseException({
        status: 422,
        message: 'Invalid old password.',
      });
    }

    if (this.isConfirmed && !(await this.isConfirmed(user))) {
      throw new BaseException({
        status: 422,
        message: 'Invalid confirmation code.',
      });
    }

    user.password = this.newPassword;
    this.repository.encryptPassword(user);

    return this.repository.save(user);
  }
}

export default ChangePassword;

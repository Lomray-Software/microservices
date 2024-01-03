import { BaseException } from '@lomray/microservice-nodejs-lib';
import { validate } from 'class-validator';
import ExceptionCode from '@constants/exception-code';
import User from '@entities/user';
import UserRepository from '@repositories/user';
import { ConfirmBy } from '@services/confirm/factory';

export interface IChangeLoginParams {
  userId: string;
  login: string;
  confirmBy: ConfirmBy;
  isConfirmed: () => Promise<boolean> | boolean;
  repository: UserRepository;
}

/**
 * Change user login: email or phone
 */
class ChangeLogin {
  /**
   * @protected
   */
  protected readonly userId: IChangeLoginParams['userId'];

  /**
   * @protected
   */
  protected readonly login: IChangeLoginParams['login'];

  /**
   * @protected
   */
  protected readonly confirmBy: IChangeLoginParams['confirmBy'];

  /**
   * @protected
   */
  protected readonly isConfirmed: IChangeLoginParams['isConfirmed'];

  /**
   * @protected
   */
  protected readonly repository: IChangeLoginParams['repository'];

  /**
   * @constructor
   */
  protected constructor({ userId, login, confirmBy, repository, isConfirmed }: IChangeLoginParams) {
    this.userId = userId;
    this.login = login;
    this.confirmBy = confirmBy;
    this.isConfirmed = isConfirmed;
    this.repository = repository;
  }

  /**
   * Init service
   */
  static init(params: IChangeLoginParams): ChangeLogin {
    return new ChangeLogin(params);
  }

  /**
   * Change login
   */
  public async change(): Promise<User> {
    if (!(await this.isConfirmed())) {
      throw new BaseException({
        status: 422,
        message: 'Invalid confirmation code.',
      });
    }

    const user = await this.repository.findOne({ id: this.userId });

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

    user[this.confirmBy] = this.login;

    const errors = await validate(user, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new BaseException({
        status: 422,
        message: 'Validation failed.',
        payload: errors,
      });
    }

    return this.repository.save(user);
  }
}

export default ChangeLogin;

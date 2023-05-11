import { EntityColumns } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import ExceptionCode from '@constants/exception-code';
import User from '@entities/user';
import UserRepository from '@repositories/user';

export interface ISignInParams {
  login: string;
  password: string;
  repository: UserRepository;
}

/**
 * Sign in user
 */
class SignIn {
  /**
   * @protected
   */
  protected readonly login: ISignInParams['login'];

  /**
   * @protected
   */
  protected readonly password: ISignInParams['password'];

  /**
   * @protected
   */
  protected readonly repository: ISignInParams['repository'];

  /**
   * @constructor
   */
  protected constructor({ login, password, repository }: ISignInParams) {
    this.login = login;
    this.password = password;
    this.repository = repository;
  }

  /**
   * Init service
   */
  static init(params: ISignInParams): SignIn {
    return new SignIn(params);
  }

  /**
   * Sign in user
   */
  public async auth(): Promise<User> {
    const user = await this.repository.findOne(
      {
        ...(this.isEmail() ? { email: this.login } : { phone: this.login }),
      },
      { relations: ['profile'], select: EntityColumns(this.repository) },
    );

    if (typeof user?.deletedAt?.toString() === 'string') {
      throw new BaseException({
        status: 400,
        message: 'Account was removed.',
      });
    }

    if (!user || !this.repository.isValidPassword(user, this.password)) {
      throw new BaseException({
        code: ExceptionCode.LOGIN_PASSWORD_INCORRECT,
        message: 'Login or password incorrect.',
        status: 422,
      });
    }

    return user;
  }

  /**
   * Check login is email
   * @protected
   */
  protected isEmail(): boolean {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(this.login).toLowerCase(),
    );
  }
}

export default SignIn;

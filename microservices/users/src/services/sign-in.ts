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
   * @private
   */
  private readonly login: ISignInParams['login'];

  /**
   * @private
   */
  private readonly password: ISignInParams['password'];

  /**
   * @private
   */
  private readonly repository: ISignInParams['repository'];

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
      { relations: ['profile'] },
    );

    if (!user || !this.repository.isValidPassword(user, this.password)) {
      throw new Error('Login or password incorrect.');
    }

    return user;
  }

  /**
   * Check login is email
   * @private
   */
  private isEmail(): boolean {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(this.login).toLowerCase(),
    );
  }
}

export default SignIn;

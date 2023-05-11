import { EntityColumns } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import ExceptionCode from '@constants/exception-code';
import UserRepository from '@repositories/user';

export interface IRemoveAccountParams {
  userId: string;
  password: string;
  repository: UserRepository;
}

/**
 * Remove user account
 */
class RemoveAccount {
  /**
   * @protected
   */
  protected readonly userId: IRemoveAccountParams['userId'];

  /**
   * @protected
   */
  protected readonly password: IRemoveAccountParams['password'];

  /**
   * @protected
   */
  protected readonly repository: IRemoveAccountParams['repository'];

  /**
   * @constructor
   */
  protected constructor({ userId, password, repository }: IRemoveAccountParams) {
    this.userId = userId;
    this.password = password;
    this.repository = repository;
  }

  /**
   * Init service
   */
  static init(params: IRemoveAccountParams): RemoveAccount {
    return new RemoveAccount(params);
  }

  /**
   * Remove user account
   */
  public async remove(): Promise<boolean> {
    const user = await this.repository.findOne(this.userId, {
      select: EntityColumns(this.repository),
    });

    if (!user || !this.repository.isValidPassword(user, this.password)) {
      throw new BaseException({
        code: ExceptionCode.LOGIN_PASSWORD_INCORRECT,
        message: 'Login or password incorrect.',
        status: 422,
      });
    }

    await this.repository.softDelete(this.userId);

    return true;
  }
}

export default RemoveAccount;

import { BaseException } from '@lomray/microservice-nodejs-lib';
import { validate } from 'class-validator';
import User from '@entities/user';
import UserRepository from '@repositories/user';

export interface ISignUpParams {
  fields: Partial<User>;
  isConfirmed: () => Promise<boolean> | boolean;
  repository: UserRepository;
}

/**
 * Sign up user
 */
class SignUp {
  /**
   * @private
   */
  private readonly fields: ISignUpParams['fields'];

  /**
   * @private
   */
  private readonly isConfirmed: ISignUpParams['isConfirmed'];

  /**
   * @private
   */
  private readonly repository: ISignUpParams['repository'];

  /**
   * @constructor
   */
  protected constructor({ fields, repository, isConfirmed }: ISignUpParams) {
    this.fields = fields;
    this.isConfirmed = isConfirmed;
    this.repository = repository;
  }

  /**
   * Init service
   */
  static init(params: ISignUpParams): SignUp {
    return new SignUp(params);
  }

  /**
   * Sign up user
   */
  public async register(): Promise<User> {
    const entity = this.repository.create(this.fields);
    const errors = await validate(entity, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      throw new BaseException({
        status: 422,
        message: 'Validation failed.',
        payload: errors,
      });
    }

    if (entity.email && entity.phone) {
      throw new BaseException({
        status: 422,
        message: 'Either email or phone number must be sent.',
      });
    }

    if (!(await this.isConfirmed())) {
      throw new BaseException({
        status: 422,
        message: 'Invalid confirmation code.',
      });
    }

    this.repository.encryptPassword(entity);

    return this.repository.save(entity);
  }
}

export default SignUp;

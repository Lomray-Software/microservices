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
   * @protected
   */
  protected readonly fields: ISignUpParams['fields'];

  /**
   * @protected
   */
  protected readonly isConfirmed: ISignUpParams['isConfirmed'];

  /**
   * @protected
   */
  protected readonly repository: ISignUpParams['repository'];

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
    const errors = await validate(entity, {
      whitelist: true,
      forbidNonWhitelisted: true,
      groups: ['create', 'sign-up', this.repository.metadata.name],
      always: true,
      validationError: { target: false },
    });

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

    await this.repository.encryptPassword(entity);

    const user = await this.repository.save(entity);

    await this.repository.attachProfile(user, {
      ...(entity.email ? { isEmailVerified: true } : { isPhoneVerified: true }),
    });

    return user;
  }
}

export default SignUp;

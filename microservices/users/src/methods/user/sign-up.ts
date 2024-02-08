import { Endpoint, IsMeta, IsType, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { getCustomRepository, getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import User from '@entities/user';
import UserRepository from '@repositories/user';
import { Factory, ConfirmBy } from '@services/confirm/factory';
import SignUp from '@services/sign-up';

class SignUpInput {
  @IsObject()
  @Type(() => User)
  fields: Partial<User>;

  @IsEnum(ConfirmBy)
  confirmBy: ConfirmBy;

  @IsType(['string', 'number'])
  @IsNotEmpty()
  confirmCode: string | number;

  @IsObject()
  @IsUndefinable()
  context?: Record<string, any>;
}

class SignUpOutput {
  @IsMeta()
  @Type(() => User)
  user: User;
}

/**
 * Sign up user
 * NOTE: before call this method, you need send confirmation code, see 'confirm-code.send'
 */
const signUp = Endpoint.custom(
  () => ({ input: SignUpInput, output: SignUpOutput, description: 'Sign up user' }),
  async ({ fields, confirmBy, confirmCode, context }) => {
    const confirmService = Factory.create(confirmBy, getRepository(ConfirmCode), context);
    const service = SignUp.init({
      fields,
      isConfirmed: () => confirmService.verifyCode(fields[confirmBy], confirmCode),
      repository: getCustomRepository(UserRepository),
    });

    return {
      user: await service.register(),
    };
  },
);

export { SignUpInput, SignUpOutput, signUp };

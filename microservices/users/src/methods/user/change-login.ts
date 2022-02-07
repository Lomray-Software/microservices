import { Endpoint, IsType } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { getCustomRepository, getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import UserRepository from '@repositories/user';
import ChangeLogin from '@services/change-login';
import { Factory, ConfirmBy } from '@services/confirm/factory';

class ChangeLoginInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  login: string;

  @IsEnum(ConfirmBy)
  confirmBy: ConfirmBy;

  @IsType(['string', 'number'])
  @IsNotEmpty()
  confirmCode: string | number;
}

class ChangeLoginOutput {
  @IsBoolean()
  isChanged: boolean;
}

/**
 * Change user login, e.g.: email, phone
 */
const changeLogin = Endpoint.custom(
  () => ({ input: ChangeLoginInput, output: ChangeLoginOutput }),
  async ({ userId, login, confirmBy, confirmCode }) => {
    const confirmService = Factory.create(confirmBy, getRepository(ConfirmCode));
    const service = ChangeLogin.init({
      userId,
      login,
      confirmBy,
      isConfirmed: () => confirmService.verifyCode(login, confirmCode),
      repository: getCustomRepository(UserRepository),
    });

    return {
      isChanged: Boolean(await service.change()),
    };
  },
);

export default changeLogin;

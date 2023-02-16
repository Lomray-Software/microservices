import { Endpoint, IsType, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { getCustomRepository, getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import User from '@entities/user';
import UserRepository from '@repositories/user';
import ChangePassword from '@services/change-password';
import { Factory, ConfirmBy } from '@services/confirm/factory';

class ChangePasswordInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsUndefinable()
  @ValidateIf(({ confirmCode, oldPassword }) => !confirmCode || oldPassword)
  oldPassword?: string;

  @IsEnum(ConfirmBy)
  @IsUndefinable()
  @ValidateIf(({ confirmCode }) => confirmCode)
  confirmBy?: ConfirmBy;

  @IsType(['string', 'number'])
  @IsNotEmpty()
  @IsUndefinable()
  @ValidateIf(({ confirmCode, oldPassword }) => !oldPassword || confirmCode)
  confirmCode?: string | number;

  @IsBoolean()
  @IsUndefinable()
  allowByAdmin?: boolean;
}

class ChangePasswordOutput {
  @IsBoolean()
  isChanged: boolean;
}

/**
 * Change user password
 */
const changePassword = Endpoint.custom(
  () => ({
    input: ChangePasswordInput,
    output: ChangePasswordOutput,
    description: 'Change user password',
  }),
  async ({ userId, newPassword, oldPassword, confirmBy, confirmCode, allowByAdmin }) => {
    const service = ChangePassword.init({
      userId,
      newPassword,
      oldPassword,
      isConfirmed: (user: User) =>
        (confirmBy &&
          Factory.create(confirmBy, getRepository(ConfirmCode)).verifyCode(
            user[confirmBy],
            confirmCode,
          )) ||
        allowByAdmin,
      repository: getCustomRepository(UserRepository),
    });

    return {
      isChanged: Boolean(await service.change()),
    };
  },
);

export { ChangePasswordInput, ChangePasswordOutput, changePassword };

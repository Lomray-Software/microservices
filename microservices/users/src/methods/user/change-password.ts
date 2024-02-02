import { Endpoint, IsType, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { getCustomRepository, getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import User from '@entities/user';
import type TClearUserTokens from '@interfaces/clear-user-tokens';
import UserRepository from '@repositories/user';
import ChangePassword from '@services/change-password';
import { Factory, ConfirmBy } from '@services/confirm/factory';

class ChangePasswordInput {
  @IsString()
  @IsNotEmpty()
  @ValidateIf(({ login }) => !login)
  userId?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf(({ userId }) => !userId)
  login?: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf(({ confirmCode, oldPassword }) => !confirmCode || oldPassword)
  oldPassword?: string;

  @IsEnum(ConfirmBy)
  @ValidateIf(({ confirmCode }) => confirmCode)
  confirmBy?: ConfirmBy;

  @IsType(['string', 'number'])
  @IsNotEmpty()
  @ValidateIf(({ confirmCode, oldPassword }) => !oldPassword || confirmCode)
  confirmCode?: string | number;

  @IsBoolean()
  @IsUndefinable()
  allowByAdmin?: boolean;

  @IsString()
  @IsUndefinable()
  clearTokensType?: TClearUserTokens;
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
  async ({
    userId,
    login,
    newPassword,
    oldPassword,
    confirmBy,
    confirmCode,
    allowByAdmin,
    clearTokensType,
    payload,
  }) => {
    const service = ChangePassword.init({
      userId,
      confirmBy,
      login,
      isConfirmed: (user: User) =>
        (confirmBy &&
          Factory.create(confirmBy, getRepository(ConfirmCode)).verifyCode(
            user[confirmBy],
            confirmCode,
          )) ||
        allowByAdmin,
      repository: getCustomRepository(UserRepository),
      clearTokensType,
      currentToken: payload?.authentication?.tokenId,
    });

    return {
      isChanged: Boolean(await service.change(newPassword, oldPassword)),
    };
  },
);

export { ChangePasswordInput, ChangePasswordOutput, changePassword };

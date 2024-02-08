import { Endpoint, IsType, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsString, ValidateIf } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
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

  @JSONSchema({
    description: 'Skip if change password has allowed by admin',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    ({ confirmCode, oldPassword, allowByAdmin }) => !allowByAdmin && (!confirmCode || oldPassword),
  )
  oldPassword?: string;

  @IsEnum(ConfirmBy)
  @ValidateIf(({ confirmCode }) => confirmCode)
  confirmBy?: ConfirmBy;

  @JSONSchema({
    description: 'Skip if change password has allowed by admin',
  })
  @IsType(['string', 'number'])
  @IsNotEmpty()
  @ValidateIf(
    ({ confirmCode, oldPassword, allowByAdmin }) => !allowByAdmin && (!oldPassword || confirmCode),
  )
  confirmCode?: string | number;

  @IsBoolean()
  @IsUndefinable()
  allowByAdmin?: boolean;

  @IsString()
  @IsUndefinable()
  clearTokensType?: TClearUserTokens;

  @IsObject()
  @IsUndefinable()
  context?: Record<string, any>;
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
    context,
    clearTokensType,
    payload,
  }) => {
    const service = ChangePassword.init({
      userId,
      confirmBy,
      login,
      isConfirmed: (user: User) =>
        (confirmBy &&
          Factory.create(confirmBy, getRepository(ConfirmCode), context).verifyCode(
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

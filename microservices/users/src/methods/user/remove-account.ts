import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { getCustomRepository } from 'typeorm';
import UserRepository from '@repositories/user';
import RemoveAccount from '@services/remove-account';

class RemoveAccountInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class RemoveAccountOutput {
  @IsBoolean()
  isRemoved: boolean;
}

/**
 * Remove user account
 * NOTE: User should call this
 */
const removeAccount = Endpoint.custom(
  () => ({
    input: RemoveAccountInput,
    output: RemoveAccountOutput,
    description: 'Remove user account',
  }),
  async ({ userId, password }) => ({
    isRemoved: await RemoveAccount.init({
      userId,
      password,
      repository: getCustomRepository(UserRepository),
    }).remove(),
  }),
);

export { RemoveAccountInput, RemoveAccountOutput, removeAccount };

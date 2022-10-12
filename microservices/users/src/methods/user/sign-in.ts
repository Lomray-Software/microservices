import { Endpoint, IsMeta } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { getCustomRepository } from 'typeorm';
import User from '@entities/user';
import UserRepository from '@repositories/user';
import SignIn from '@services/sign-in';

class SignInInput {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class SignInOutput {
  @IsMeta()
  @Type(() => User)
  user: User;
}

/**
 * Sign in user
 */
const signIn = Endpoint.custom(
  () => ({ input: SignInInput, output: SignInOutput, description: 'Sign in user' }),
  async ({ login, password }) => {
    const service = SignIn.init({
      login,
      password,
      repository: getCustomRepository(UserRepository),
    });

    return {
      user: await service.auth(),
    };
  },
);

export { SignInInput, SignInOutput, signIn };

import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { getCustomRepository } from 'typeorm';
import UserRepository from '@repositories/user';

class CheckUsernameInput {
  @IsString()
  @IsNotEmpty()
  username: string;
}

class CheckUsernameOutput {
  @IsBoolean()
  isUnique: boolean;
}

/**
 * Check if username is unique
 */
const checkUsername = Endpoint.custom(
  () => ({
    input: CheckUsernameInput,
    output: CheckUsernameOutput,
    description: 'Check if username is unique',
  }),
  async ({ username }) => {
    const userRepository = getCustomRepository(UserRepository);

    const user = await userRepository.findOne({ username }, { select: ['id'] });

    return {
      isUnique: !user,
    };
  },
);

export { CheckUsernameInput, CheckUsernameOutput, checkUsername };

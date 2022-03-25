import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

class SignOutInput {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class SignOutOutput {
  @IsBoolean()
  loggedOut: boolean;
}

/**
 * Sign out user
 * This method only for add remote middlewares (e.g.: remove auth tokens from authentication microservice)
 */
const signOut = Endpoint.custom(
  () => ({ input: SignOutInput, output: SignOutOutput, description: 'Sign out user' }),
  () => ({
    loggedOut: true,
  }),
);

export default signOut;

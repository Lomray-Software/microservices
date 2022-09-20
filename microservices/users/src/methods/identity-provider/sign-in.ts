import { Endpoint, IsMeta, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import IdProvider from '@constants/id-provider';
import User from '@entities/user';
import Factory from '@services/identity-provider/factory';

class IdentityProviderSignInInput {
  @IsEnum(IdProvider)
  provider: IdProvider;

  @JSONSchema({
    description: 'User identity provider token or code. E.g: auth.getToken()',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsObject()
  @IsUndefinable()
  params?: Record<string, any> = {};
}

class IdentityProviderSignInOutput {
  @IsMeta()
  @Type(() => User)
  user: User;

  @IsBoolean()
  isNew: boolean;
}

/**
 * Sign in through identity provider
 */
const signIn = Endpoint.custom(
  () => ({
    input: IdentityProviderSignInInput,
    output: IdentityProviderSignInOutput,
    description: 'Sign in user through identity provider',
  }),
  ({ provider, token, params }) => {
    const service = Factory.create(provider, token, getManager());

    return service.signIn(params);
  },
);

export default signIn;

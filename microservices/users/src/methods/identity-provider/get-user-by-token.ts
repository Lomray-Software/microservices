import { Endpoint, IsMeta, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import IdProvider from '@constants/id-provider';
import User from '@entities/user';
import Factory from '@services/identity-provider/factory';

class GetUserByTokenIdentityProviderInput {
  @IsEnum(IdProvider)
  provider: IdProvider;

  @JSONSchema({
    description: 'User identity provider token or code. E.g: auth.getToken()',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

class GetUserByTokenIdentityProviderOutput {
  @IsMeta()
  @Type(() => User)
  @IsUndefinable()
  user?: User;
}

/**
 * Returns user by identity token
 */
const getUserByToken = Endpoint.custom(
  () => ({
    input: GetUserByTokenIdentityProviderInput,
    output: GetUserByTokenIdentityProviderOutput,
    description: 'Returns user by identity token',
  }),
  async ({ provider, token }) => {
    const service = Factory.create(provider, token, getManager());

    return { user: await service.getUserByToken() };
  },
);

export {
  GetUserByTokenIdentityProviderInput,
  GetUserByTokenIdentityProviderOutput,
  getUserByToken,
};

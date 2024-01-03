import { Endpoint, IsMeta, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import IdProvider from '@constants/id-provider';
import User from '@entities/user';
import Factory from '@services/identity-provider/factory';

class ParseIdentityProviderInput {
  @IsEnum(IdProvider)
  provider: IdProvider;

  @JSONSchema({
    description: 'User identity provider token or code. E.g: auth.getToken()',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

class ParseIdentityProviderOutput {
  @IsMeta()
  @Type(() => User)
  @IsUndefinable()
  user?: User;
}

/**
 * Parse identity and returns users
 */
const parse = Endpoint.custom(
  () => ({
    input: ParseIdentityProviderInput,
    output: ParseIdentityProviderOutput,
    description: 'Parse identity and returns users',
  }),
  async ({ provider, token }) => {
    const service = Factory.create(provider, token, getManager());

    return { user: await service.getUserByToken() };
  },
);

export { ParseIdentityProviderInput, ParseIdentityProviderOutput, parse };

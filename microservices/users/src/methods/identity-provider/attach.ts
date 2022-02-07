import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import { IdProvider } from '@entities/identity-provider';
import User from '@entities/user';
import Factory from '@services/identity-provider/factory';

class IdentityProviderAttachInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

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
  params: Record<string, any> = {};
}

class IdentityProviderAttachOutput {
  @IsObject()
  @Type(() => User)
  user: User;
}

/**
 * Attach new identity provider to existing user
 */
const attach = Endpoint.custom(
  () => ({ input: IdentityProviderAttachInput, output: IdentityProviderAttachOutput }),
  async ({ userId, provider, token, params }) => {
    const service = Factory.create(provider, token, getManager());

    return {
      user: await service.attachProvider(userId, params),
    };
  },
);

export default attach;

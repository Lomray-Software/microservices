import { IsUndefinable } from '@lomray/microservice-helpers';
import type { IMicroserviceResponseCookie } from '@lomray/microservice-nodejs-lib';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { IsEnum, IsObject, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Repository } from 'typeorm';
import type { IJwtConfig } from '@config/jwt';
import Token from '@entities/token';
import { TokenCreateReturnType } from '@services/methods/create-auth-token';
import Jwt from '@services/tokens/jwt';

class TokenRenewInput {
  @Length(1, 300)
  access: string;

  @Length(1, 300)
  refresh: string;

  @IsUndefinable()
  @IsObject()
  params?: Record<string, any>;

  @IsUndefinable()
  @IsObject()
  jwtPayload?: Record<string, any>;

  @IsUndefinable()
  @IsEnum(TokenCreateReturnType)
  returnType = TokenCreateReturnType.directly;
}

@JSONSchema({
  description:
    'Return structure for this method depends on ReturnType (see input param "type"). In case with "cookie" return type, you will get only refresh token, because access token will be set on Cookies (it will handle itself).',
  examples: [
    { access: 'access-token', refresh: 'refresh-token' },
    { payload: { access: 'access-token', refresh: 'refresh-token' } },
    { payload: { refresh: 'refresh-token-if-type-is-cookies' } },
  ],
})
class TokenRenewOutput {
  @IsUndefinable()
  @IsString()
  access?: string;

  @IsUndefinable()
  @IsString()
  refresh?: string;

  @IsUndefinable()
  @IsObject()
  payload?:
    | { access: string; refresh: string }
    | { refresh: string; cookies: IMicroserviceResponseCookie[] };
}

/**
 * Renew auth tokens
 */
class RenewAuthToken {
  /**
   * @private
   */
  private repository: Repository<Token>;

  /**
   * @private
   */
  private readonly jwtConfig: IJwtConfig;

  /**
   * @constructor
   */
  constructor(repository: Repository<Token>, jwtConfig: IJwtConfig) {
    this.repository = repository;
    this.jwtConfig = jwtConfig;
  }

  /**
   * Renew jwt tokens
   * @private
   */
  private async renewJwtTokens(
    options: TokenRenewInput,
  ): Promise<{ access: string; refresh: string }> {
    const { access, refresh, params, jwtPayload } = options;
    const { secretKey, ...jwtOptions } = this.jwtConfig;
    const jwtService = new Jwt(secretKey, jwtOptions);
    const { jti } = jwtService.validate(access, { ignoreExpiration: true });
    const { jti: refreshJti } = jwtService.validate(refresh);

    if (jti !== refreshJti) {
      throw new BaseException({
        message: 'Invalid pair access and refresh tokens.',
        status: 401,
      });
    }

    const dbToken = await this.repository.findOne({ id: jti });

    if (!dbToken) {
      throw new BaseException({
        message: 'Authentication token not found.',
        status: 401,
      });
    }

    const result = jwtService.create(dbToken.id, {
      ...(jwtPayload ?? {}),
      userId: dbToken.userId,
    });
    const { exp } = jwtService.decode(result.access);

    dbToken.access = result.access;
    dbToken.refresh = result.refresh;
    dbToken.params = { ...dbToken.params, ...(params ?? {}) };
    dbToken.expirationAt = exp ?? null;

    await this.repository.save(dbToken);

    return result;
  }

  /**
   * Renew auth token
   */
  async renew(options: TokenRenewInput): Promise<TokenRenewOutput> {
    const { returnType } = options;

    const result = await this.renewJwtTokens(options);

    switch (returnType) {
      case TokenCreateReturnType.directly:
        return result;

      case TokenCreateReturnType.payload:
        return { payload: result };
    }

    return {
      payload: {
        refresh: result['refresh'],
        cookies: [
          {
            action: 'add',
            name: 'jwt-access',
            value: result['access'],
            options: { httpOnly: true },
          },
        ],
      },
    };
  }
}

export { RenewAuthToken, TokenRenewInput, TokenRenewOutput };

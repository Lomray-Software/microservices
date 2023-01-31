import { IsUndefinable } from '@lomray/microservice-helpers';
import type { IMicroserviceResponseCookie } from '@lomray/microservice-nodejs-lib';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { IsEnum, IsObject, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import type { Repository } from 'typeorm';
import cookiesConfig from '@config/cookies';
import type { IJwtConfig } from '@config/jwt';
import CONST from '@constants/index';
import type Token from '@entities/token';
import BaseAuthToken from '@services/methods/base-auth-token';
import { TokenCreateReturnType } from '@services/methods/create-auth-token';

class TokenRenewInput {
  @IsUndefinable() // can be obtained from headers
  @Length(1, 1000)
  access?: string;

  @Length(1, 1000)
  refresh: string;

  @IsUndefinable()
  @IsObject()
  params?: Record<string, any> & { maxAge?: number };

  @IsUndefinable()
  @IsObject()
  jwtPayload?: Record<string, any>;

  @IsUndefinable()
  @IsEnum(TokenCreateReturnType)
  returnType = TokenCreateReturnType.directly;
}

@JSONSchema({
  description:
    'Return structure for this method depends on ReturnType (see input param "returnType"). In case with "cookie" return type, you will get only refresh token, because access token will be set on Cookies (it will handle itself).',
  examples: [
    { access: 'access-token', refresh: 'refresh-token' },
    { refresh: 'refresh-token-in-case-with-cookies' },
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
  payload?: { cookies: IMicroserviceResponseCookie[] };
}

/**
 * Renew auth tokens
 */
class RenewAuthToken extends BaseAuthToken {
  /**
   * @private
   */
  private repository: Repository<Token>;

  /**
   * @constructor
   */
  constructor(repository: Repository<Token>, jwtConfig: IJwtConfig) {
    super(jwtConfig);

    this.repository = repository;
  }

  /**
   * Renew jwt tokens
   * @private
   */
  private async renewJwtTokens(
    options: TokenRenewInput,
  ): Promise<{ access: string; refresh: string }> {
    const { access, refresh, params, jwtPayload } = options;

    const jwtService = await this.getJwtService();
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
      ...(dbToken.jwtPayload ?? {}),
      userId: dbToken.userId,
    });
    const { exp } = jwtService.decode(result.access);

    dbToken.access = result.access;
    dbToken.refresh = result.refresh;
    dbToken.params = { ...dbToken.params, ...(params ?? {}) };
    dbToken.jwtPayload = { ...dbToken.jwtPayload, ...(jwtPayload ?? {}) };
    dbToken.expirationAt = exp ?? null;

    await this.repository.save(dbToken);

    return result;
  }

  /**
   * Renew auth token
   */
  async renew(options: TokenRenewInput, headers?: Record<string, any>): Promise<TokenRenewOutput> {
    const { returnType, access, params } = options;

    const result = await this.renewJwtTokens({
      ...options,
      access: access ?? (await this.getToken(headers)),
    });

    return returnType === TokenCreateReturnType.cookies
      ? {
          refresh: result['refresh'],
          payload: {
            cookies: [
              {
                action: 'add',
                name: 'jwt-access',
                value: result['access'],
                options: {
                  ...(await cookiesConfig()),
                  maxAge:
                    params?.maxAge ??
                    (this.jwtConfig?.expirationRefresh ?? CONST.DEFAULT_REFRESH_EXPIRATION) * 1000,
                },
              },
            ],
          },
        }
      : result;
  }
}

export { RenewAuthToken, TokenRenewInput, TokenRenewOutput };

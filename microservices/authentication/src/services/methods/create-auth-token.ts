import { IsTimestamp, IsUndefinable } from '@lomray/microservice-helpers';
import type { IMicroserviceResponseCookie } from '@lomray/microservice-nodejs-lib';
import { IsEnum, IsObject, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import type { Repository } from 'typeorm';
import cookiesConfig from '@config/cookies';
import type { IJwtConfig } from '@config/jwt';
import CONST from '@constants/index';
import TokenType from '@constants/token-type';
import type Token from '@entities/token';
import BaseAuthToken from '@services/methods/base-auth-token';
import Personal from '@services/tokens/personal';

enum TokenCreateReturnType {
  cookies = 'cookies',
  directly = 'directly',
}

class TokenCreateInput {
  @IsEnum(TokenType)
  type: TokenType;

  @Length(1, 36)
  userId: string;

  @IsTimestamp()
  @IsUndefinable()
  expirationAt?: number;

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
    'Return structure for this method depends on "TokenType" (see input param "type"). In case with "cookie" return type, you will get only refresh token, because access token will be set on Cookies (it will handle itself).',
  examples: [
    { access: 'access-token', refresh: 'refresh-token' },
    { refresh: 'refresh-token-in-case-with-cookies' },
    { token: 'bearer-token' },
  ],
})
class TokenCreateOutput {
  @IsUndefinable()
  @IsString()
  access?: string;

  @IsUndefinable()
  @IsString()
  refresh?: string;

  @IsUndefinable()
  @IsString()
  token?: string;

  @IsUndefinable()
  @IsObject()
  payload?: { cookies: IMicroserviceResponseCookie[] };
}

/**
 * Create auth tokens
 */
class CreateAuthToken extends BaseAuthToken {
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
   * Create personal token
   * @private
   */
  private async createPersonalToken(options: TokenCreateInput): Promise<{ token: string }> {
    const { userId, expirationAt, params } = options;
    const personalToken = Personal.generate();

    const token = this.repository.create({
      type: TokenType.personal,
      userId,
      personal: personalToken,
      expirationAt,
      params,
    });

    await this.repository.save(token);

    return { token: personalToken };
  }

  /**
   * Create jwt tokens
   * @private
   */
  private async createJwtTokens(
    options: TokenCreateInput,
  ): Promise<{ access: string; refresh: string }> {
    const { userId, expirationAt, params, jwtPayload } = options;

    const jwtService = await this.getJwtService();
    const dbToken = await this.repository.save(
      this.repository.create({
        type: TokenType.jwt,
        userId,
        access: 'temp',
        refresh: 'temp-refresh',
        expirationAt,
        params,
        jwtPayload,
      }),
    );
    const { access, refresh } = jwtService.create(dbToken.id, { ...(jwtPayload ?? {}), userId });
    const { exp } = jwtService.decode(refresh);

    dbToken.access = access;
    dbToken.refresh = refresh;
    dbToken.expirationAt = exp ?? null;

    await this.repository.save(dbToken);

    return { access, refresh };
  }

  /**
   * Create auth token(s)
   */
  async create(options: TokenCreateInput): Promise<TokenCreateOutput> {
    const { type, returnType, params } = options;

    if (returnType === TokenCreateReturnType.cookies && type === TokenType.personal) {
      throw new Error('Return type "cookies" available only with type "jwt".');
    }

    const result =
      type === TokenType.jwt
        ? await this.createJwtTokens(options)
        : await this.createPersonalToken(options);

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

export { CreateAuthToken, TokenCreateInput, TokenCreateOutput, TokenCreateReturnType };

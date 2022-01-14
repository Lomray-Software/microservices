import { IsUndefinable } from '@lomray/microservice-helpers';
import type { IMicroserviceResponseCookie } from '@lomray/microservice-nodejs-lib';
import { IsEnum, IsObject, IsRFC3339, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Repository } from 'typeorm';
import type { IJwtConfig } from '@config/jwt';
import Token, { TokenType } from '@entities/token';
import Jwt from '@services/tokens/jwt';
import Personal from '@services/tokens/personal';

enum TokenCreateReturnType {
  cookies = 'cookies',
  payload = 'payload',
  directly = 'directly',
}

class TokenCreateInput {
  @IsEnum(TokenType)
  type: TokenType;

  @Length(1, 36)
  userId: string;

  @IsUndefinable()
  @IsRFC3339() // timestamp validator
  expirationAt?: number;

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
    { token: 'bearer-token' },
    { payload: { access: 'access-token', refresh: 'refresh-token' } },
    { payload: { refresh: 'refresh-token-if-type-is-cookies' } },
    { payload: { token: 'bearer-token' } },
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
  payload?:
    | { access: string; refresh: string }
    | { token: string }
    | { refresh: string; cookies: IMicroserviceResponseCookie[] };
}

/**
 * Create auth tokens
 */
class CreateAuthToken {
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
    const { secretKey, ...jwtOptions } = this.jwtConfig;

    const dbToken = await this.repository.save(
      this.repository.create({
        type: TokenType.jwt,
        userId,
        access: 'temp',
        refresh: 'temp-refresh',
        expirationAt,
        params,
      }),
    );
    const jwtService = new Jwt(secretKey, jwtOptions);
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
    const { type, returnType } = options;

    if (returnType === TokenCreateReturnType.cookies && type === TokenType.personal) {
      throw new Error('Return type "cookies" available only with type "jwt".');
    }

    const result =
      type === TokenType.jwt
        ? await this.createJwtTokens(options)
        : await this.createPersonalToken(options);

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

export { CreateAuthToken, TokenCreateInput, TokenCreateOutput, TokenCreateReturnType };

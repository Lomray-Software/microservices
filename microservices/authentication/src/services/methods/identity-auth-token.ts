import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { IsBoolean, IsEnum, IsNumber, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Repository } from 'typeorm';
import type { IJwtConfig } from '@config/jwt';
import AuthProviders from '@constants/auth-providers';
import UnauthorizedCode from '@constants/unauthorized-code';
import Token from '@entities/token';
import BaseAuthToken from '@services/methods/base-auth-token';

class TokenIdentifyInput {
  @Length(1, 1000)
  @IsUndefinable()
  token?: string;
}

@JSONSchema({
  examples: [{ userId: 'sample-user-id', isAuth: true, provider: 'jwt' }],
})
class TokenIdentifyOutput {
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  tokenId?: string | null;

  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId?: string | number | null;

  @IsBoolean()
  @IsUndefinable()
  isAuth?: boolean;

  @IsEnum(AuthProviders)
  @IsUndefinable()
  provider?: AuthProviders | null;

  @IsNumber()
  @IsNullable()
  @IsUndefinable()
  accessExpirationAt?: number | null;

  @IsNumber()
  @IsNullable()
  @IsUndefinable()
  expirationAt?: number | null;
}

/**
 * Identify auth token
 */
class IdentifyAuthToken extends BaseAuthToken {
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
   * Find auth token in db
   * @private
   */
  private async findToken(token: string): Promise<Required<Omit<TokenIdentifyOutput, 'payload'>>> {
    const isPersonal = String(token).length === 32;
    let dbToken: Token | undefined;
    let accessExpirationAt = null;

    if (!isPersonal) {
      const jwtService = await this.getJwtService();
      const { jti, exp } = jwtService.validate(token);

      if (exp) {
        accessExpirationAt = exp;
      }

      dbToken = await this.repository.findOne({ id: jti });
    } else {
      dbToken = await this.repository.findOne({ personal: token });

      // Check personal token expiration
      if (dbToken && dbToken.expirationAt !== null) {
        const now = Math.round(Date.now() / 1000);

        if (now > dbToken.expirationAt) {
          throw new BaseException({
            message: 'Unauthorized',
            status: 401,
            code: UnauthorizedCode.PERSONAL_EXPIRED,
            payload: { message: 'Personal access token expired.' },
          });
        }
      }
    }

    if (!dbToken) {
      throw new BaseException({
        message: 'Unauthorized',
        status: 401,
        code: UnauthorizedCode.TOKEN_NOT_EXIST,
        payload: { message: 'Auth token not exist.' },
      });
    }

    return {
      tokenId: dbToken.id,
      userId: dbToken.userId,
      isAuth: true,
      provider: isPersonal ? AuthProviders.personal : AuthProviders.jwt,
      expirationAt: dbToken.expirationAt || null,
      accessExpirationAt,
    };
  }

  /**
   * Identify token
   */
  public async identify(
    params: TokenIdentifyInput,
    headers?: Record<string, any>,
  ): Promise<TokenIdentifyOutput> {
    const { token } = params;
    const authToken = token ?? (await this.getToken(headers));

    if (!authToken) {
      return Promise.resolve({
        tokenId: null,
        userId: null,
        isAuth: false,
        provider: null,
        expirationAt: null,
        accessExpirationAt: null,
      });
    }

    return this.findToken(authToken);
  }
}

export { IdentifyAuthToken, TokenIdentifyInput, TokenIdentifyOutput };

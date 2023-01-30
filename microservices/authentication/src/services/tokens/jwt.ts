import { BaseException } from '@lomray/microservice-nodejs-lib';
import jsonwebtoken, {
  Algorithm,
  DecodeOptions,
  JwtPayload,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';
import CONST from '@constants/index';
import UnauthorizedCode from '@constants/unauthorized-code';

export interface IJwtParams {
  expiration?: number;
  expirationRefresh?: number;
  algorithm?: Algorithm; // default: HS256
  options?: SignOptions;
}

/**
 * Create JWT tokens
 */
class Jwt {
  /**
   * @private
   */
  private readonly secretKey: string;

  /**
   * Expiration token in seconds.
   * @private
   */
  private expiration = CONST.DEFAULT_ACCESS_EXPIRATION;

  /**
   * Expiration refresh token in seconds.
   * @private
   */
  private expirationRefresh = CONST.DEFAULT_REFRESH_EXPIRATION;

  /**
   * @private
   */
  private algorithm: Algorithm = 'HS256';

  /**
   * JWT token options
   * @private
   */
  private options: SignOptions = {};

  /**
   * @constructor
   */
  constructor(secretKey: string, params?: IJwtParams) {
    this.secretKey = secretKey;

    Object.assign(this, params);
  }

  /**
   * Get sign options
   * @private
   */
  private getOptions(): SignOptions {
    return { algorithm: this.algorithm, ...this.options };
  }

  /**
   * Build audience array
   */
  public static getAudience(
    baseAud: (string | undefined)[],
    options?: SignOptions,
  ): { audience?: string[] } {
    const audience = [...baseAud, options?.audience].flat().filter(Boolean) as string[];

    return audience.length ? { audience } : {};
  }

  /**
   * Create access & refresh tokens
   */
  public create(
    jwtid: string,
    payload: Record<string, any> = {},
  ): { access: string; refresh: string } {
    return {
      access: jsonwebtoken.sign(payload ?? {}, this.secretKey, {
        ...this.getOptions(),
        expiresIn: this.expiration,
        jwtid,
      }),
      refresh: jsonwebtoken.sign({ ...payload, accessExpiresIn: this.expiration }, this.secretKey, {
        ...this.getOptions(),
        expiresIn: this.expirationRefresh,
        jwtid,
      }),
    };
  }

  /**
   * Validate JWT token
   */
  public validate(tokens?: string | string[], options: VerifyOptions = {}): JwtPayload {
    const tokensArr = Array.isArray(tokens) ? tokens : ([tokens] as string[]);

    try {
      return jsonwebtoken.verify(tokensArr.shift() ?? '', this.secretKey, {
        ...this.getOptions(),
        ...options,
      }) as JwtPayload;
    } catch (e) {
      // try to find token with valid audience
      if (e.message.includes('jwt audience invalid') && tokensArr?.length) {
        return this.validate(tokensArr, options);
      }

      throw new BaseException({
        message: 'Unauthorized',
        status: 401,
        code: UnauthorizedCode.INVALID_AUTH_TOKEN,
        payload: { message: e.message },
      });
    }
  }

  /**
   * Decode JWT token
   */
  public decode(token: string, options?: DecodeOptions): JwtPayload {
    return jsonwebtoken.decode(token, options) as JwtPayload;
  }
}

export default Jwt;

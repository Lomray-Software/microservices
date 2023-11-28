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
  cookieStrategy?: number;
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
   * Cookie strategy
   * See README.md - COOKIE_AUTH_STRATEGY
   */
  private readonly cookieStrategy: number = 3;

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
  public validate(token?: string, options: VerifyOptions = {}): JwtPayload {
    try {
      return jsonwebtoken.verify(token ?? '', this.secretKey, {
        ...this.getOptions(),
        ...options,
      }) as JwtPayload;
    } catch (e) {
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

  /**
   * Try to find most suitable token by audience and request origin
   */
  public findMostSuitableToken(tokens: string[], origin = 'unknown'): string | undefined {
    let resultToken;

    for (const token of tokens) {
      const audRes = this.checkAudience(token, origin);

      // full match by audience and origin
      if (audRes === 2) {
        return token;
      } else if (audRes === 1) {
        // match by audience
        resultToken = token;
      }
    }

    switch (this.cookieStrategy) {
      case 3:
        return;

      case 2:
        return resultToken;

      case 1:
      default:
        return resultToken ?? tokens[0];
    }
  }

  /**
   * Compare service audience with token audience
   */
  protected checkAudience(token: string, origin: string): number {
    const { audience: serviceAud } = Jwt.getAudience([], this.options);
    const { aud } = this.decode(token);

    const audiences = (Array.isArray(serviceAud) ? serviceAud : [serviceAud]) as (
      | string
      | RegExp
    )[];
    const target = (Array.isArray(aud) ? aud : [aud]).filter(Boolean) as string[];

    const isMatch = target.some((targetAudience) =>
      audiences.some((audience) =>
        audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience,
      ),
    );

    if (isMatch && aud?.includes(origin)) {
      return 2;
    } else if (isMatch) {
      return 1;
    }

    return 0;
  }
}

export default Jwt;

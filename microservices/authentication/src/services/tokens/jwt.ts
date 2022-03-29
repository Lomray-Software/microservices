import { BaseException } from '@lomray/microservice-nodejs-lib';
import jsonwebtoken, {
  Algorithm,
  DecodeOptions,
  JwtPayload,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';
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
   * Expiration token in seconds. Default: 30 min
   * @private
   */
  private expiration = 1800;

  /**
   * Expiration refresh token in seconds. Default: 30 days
   * @private
   */
  private expirationRefresh = 2592000;

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
   * Create access & refresh tokens
   */
  public create(jwtid: string, payload?: Record<string, any>): { access: string; refresh: string } {
    return {
      access: jsonwebtoken.sign(payload ?? {}, this.secretKey, {
        ...this.getOptions(),
        expiresIn: this.expiration,
        jwtid,
      }),
      refresh: jsonwebtoken.sign(payload ?? {}, this.secretKey, {
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
      return jsonwebtoken.verify(token ?? '', this.secretKey, { ...this.getOptions(), ...options });
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
}

export default Jwt;

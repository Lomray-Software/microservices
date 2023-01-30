import type { ICookiesConfig } from '@config/cookies';
import type { IJwtConfig } from '@config/jwt';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  jwtOptions?: IJwtConfig;
  cookieOptions?: ICookiesConfig;
}

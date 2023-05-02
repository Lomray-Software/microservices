import type { CorsOptions } from 'cors';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  corsOptions?: CorsOptions;
  webhookOptions?: { url: string; allowMethods: string[] };
}

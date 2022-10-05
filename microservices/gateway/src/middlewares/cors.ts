import type { CorsOptions } from 'cors';
import defaultCors from 'cors';
import { MS_CORS_CONFIG } from '@constants/index';

/**
 * Create cors middleware
 */
const cors = (options: CorsOptions = {}) => {
  const corsConfig = MS_CORS_CONFIG as CorsOptions;

  // Check origin's and find regex
  if (Array.isArray(corsConfig.origin)) {
    corsConfig.origin = corsConfig.origin.map((origin: string) =>
      // if string is regex, convert to regex instance
      origin.startsWith('/') ? new RegExp(origin.replace(/^\/|\/$/g, '')) : origin,
    );
  }

  return defaultCors({ ...corsConfig, ...options });
};

export default cors;

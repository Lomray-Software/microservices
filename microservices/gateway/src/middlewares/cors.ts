import type { CorsOptions } from 'cors';
import defaultCors from 'cors';
import remoteConfig from '@config/remote';

/**
 * Create cors middleware
 */
const cors = async (options: CorsOptions = {}): Promise<ReturnType<typeof defaultCors>> => {
  const { corsOptions } = await remoteConfig();

  // Check origin's and find regex
  if (Array.isArray(corsOptions.origin)) {
    corsOptions.origin = corsOptions.origin.map((origin: string) =>
      // if string is regex, convert to regex instance
      origin.startsWith('/') ? new RegExp(origin.replace(/^\/|\/$/g, '')) : origin,
    );
  }

  return defaultCors({ ...corsOptions, ...options });
};

export default cors;

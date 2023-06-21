import ResolveSrv from '@lomray/microservice-helpers/helpers/resolve-srv';
import axios from 'axios';

interface ISyncResponse {
  result: {
    microservices: Record<string, { isSuccess?: boolean; error?: string }>;
  };
}

/**
 * Get microservices metadata and update schema in DB
 */
const syncPermissions = async () => {
  let domain = process.env.MS_CONNECTION || 'http://127.0.0.1:8001';
  const isSRV = Boolean(process.env.MS_CONNECTION_SRV ?? false);

  if (isSRV) {
    domain = await ResolveSrv(domain);
  }

  const data = {
    id: '199',
    method: 'service.sync-metadata',
    params: {
      payload: {
        isInternal: true,
      },
    },
  };

  try {
    const result = await axios.request<ISyncResponse>({
      baseURL: domain,
      url: '/ms/authorization',
      method: 'POST',
      data,
    });

    console.log('Microservices are synchronized:');

    Object.entries(result?.data?.result?.microservices ?? {}).forEach(([name, res]) => {
      console.info(
        res?.isSuccess ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m',
        `${name}: ${String(res.isSuccess ?? res.error)}`,
      );
    });
  } catch (e) {
    console.log(`Failed to sync permissions: ${e.message as string}`);
  }
};

export default syncPermissions();

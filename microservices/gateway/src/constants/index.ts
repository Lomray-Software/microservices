import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'gateway';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name }),
  MS_BATCH_LIMIT: Number(process.env.MS_BATCH_LIMIT) || undefined,
  MS_INFO_ROUTE: process.env.MS_INFO_ROUTE,
  MS_REQ_TIMEOUT: Number(process.env.MS_REQ_TIMEOUT) || undefined,
  MS_JSON_LIMIT: process.env.MS_JSON_LIMIT || '20',
  MS_LISTENER_PORT: process.env.MS_LISTENER_PORT || '3000',
  MS_CORS_CONFIG: JSON.parse(
    process.env.MS_CORS_CONFIG || '{"origin":["http://localhost:3000"],"credentials":true}',
  ),
  MS_WEBHOOK_URL: process.env.MS_WEBHOOK_URL || '/webhook/',
  MS_WEBHOOK_ALLOW_METHODS: JSON.parse(process.env.MS_WEBHOOK_ALLOW_METHODS || '[]'),
};

export default constants;

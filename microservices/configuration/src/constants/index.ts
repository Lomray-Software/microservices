import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'configuration';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: true }),
  MS_INIT_CONFIGS: process.env.MS_INIT_CONFIGS || '[]',
  MS_INIT_MIDDLEWARES: process.env.MS_INIT_MIDDLEWARES || '[]',
};

export default constants;

import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'authorization';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: true }),
  MS_DEFAULT_ROLE_ALIAS: process.env.MS_DEFAULT_ROLE_ALIAS || 'user',
  MS_IMPORT_PERMISSION: Number(process.env.MS_IMPORT_PERMISSION || 0),
};

export default constants;

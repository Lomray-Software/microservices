import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'microservice-name';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: false }),
};

export default constants;

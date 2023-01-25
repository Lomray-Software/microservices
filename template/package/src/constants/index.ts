import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import CONST from '@lomray/microservice-users/constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;

const { IS_BUILD, SRC_FOLDER } = GetConstants({
  msNameDefault: CONST.MS_NAME,
  version,
  isBuild,
  packageName: name,
});

const constants = {
  ...CONST,
  VERSION: version,
  PACKAGE_NAME: name,
  IS_BUILD,
  SRC_FOLDER,
  EXTEND_PACKAGE_NAME: CONST.PACKAGE_NAME,
};

export default constants;

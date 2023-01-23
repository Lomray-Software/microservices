import CONST from '@lomray/microservice-name/constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;

const constants = {
  ...CONST,
  VERSION: version,
  PACKAGE_NAME: name,
  IS_BUILD: isBuild,
  EXTEND_PACKAGE_NAME: CONST.PACKAGE_NAME,
};

export default constants;

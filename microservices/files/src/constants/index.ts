import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import StorageType from '@constants/storage-type';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'files';

const constants = {
  ...GetConstants({
    isBuild,
    msNameDefault,
    version,
    packageName: name,
    withDb: true,
    withAWS: true,
  }),
  IS_IMAGE_CONFIG_FROM_CONFIG_MS: Boolean(Number(process.env.IMAGE_CONFIG_FROM_CONFIG_MS ?? 1)),
  IMAGE_PROCESSING_CONFIG: JSON.parse(process.env.IMAGE_PROCESSING_CONFIG || '{}'),
  STORAGE_PATH_PREFIX: process.env.STORAGE_PATH_PREFIX || '',
  MS_STORAGE_TYPE: process.env.MS_STORAGE_TYPE || StorageType.s3,
  MS_STORAGE_DOMAIN: process.env.MS_STORAGE_DOMAIN || '',
  LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH || 'data/files',
};

export default constants;

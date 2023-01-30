import type StorageType from '@constants/storage-type';
import type { IImageProcessingConfig } from '@interfaces/image-processing-config';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  imageProcessingConfig?: IImageProcessingConfig;
  storagePathPrefix?: string;
  storageType?: StorageType;
  storageDomain?: string;
  localStoragePath?: string;
}

import { awsConfig } from '@lomray/microservice-helpers';
import AWS from 'aws-sdk';
import remoteConfig from '@config/remote';
import CONST from '@constants/index';
import StorageType from '@constants/storage-type';
import LocalStorage from '@services/storage/local';
import S3Storage from '@services/storage/s3';
import Abstract from './abstract';

/**
 * Storage factory
 */
class Factory {
  /**
   * Create storage type instance
   */
  public static async create(): Promise<Abstract> {
    const { storageType, storageDomain } = await remoteConfig();

    switch (storageType) {
      case StorageType.s3:
        const { accessKeyId, secretAccessKey, s3, region } = await awsConfig(CONST);

        return new S3Storage({
          s3: new AWS.S3({ accessKeyId, secretAccessKey, region }),
          bucketName: s3?.bucketName || '',
          bucketAcl: s3?.bucketAcl,
          domain: storageDomain,
        });

      case StorageType.local:
        return new LocalStorage();
    }

    throw new Error('Not implemented.');
  }
}

export default Factory;

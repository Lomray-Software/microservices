import CONST from '@constants/index';
import StorageType from '@constants/storage-type';
import S3AwsSdk from '@services/external/s3-aws-sdk';
import LocalStorage from '@services/storage/local';
import S3Storage from '@services/storage/s3';
import Abstract from './abstract';

const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION, BUCKET_NAME, BUCKET_ACL, IS_FROM_CONFIG_MS } =
  CONST.AWS;

/**
 * Storage factory
 */
class Factory {
  /**
   * Create storage type instance
   */
  public static async create(type: string): Promise<Abstract> {
    switch (type) {
      case StorageType.s3:
        const { s3, bucketName, bucketAcl } = await S3AwsSdk.get({
          isFromConfigMs: IS_FROM_CONFIG_MS,
          options: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY,
            region: REGION,
            bucketName: BUCKET_NAME,
            bucketAcl: BUCKET_ACL,
          },
        });

        return new S3Storage({ s3, bucketName, bucketAcl });

      case StorageType.local:
        return new LocalStorage();
    }

    throw new Error('Not implemented');
  }
}

export default Factory;

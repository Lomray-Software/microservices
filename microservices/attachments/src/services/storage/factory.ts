import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
  AWS_FROM_CONFIG_MS,
} from '@constants/index';
import StorageType from '@constants/storage-type';
import S3AwsSdk from '@services/external/s3-aws-sdk';
import S3Storage from '@services/storage/s3';
import Abstract from './abstract';

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
        const { s3, bucketName } = await S3AwsSdk.get({
          isFromConfigMs: AWS_FROM_CONFIG_MS,
          options: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION,
            bucketName: AWS_BUCKET_NAME,
          },
        });

        return new S3Storage({ s3, bucketName });
    }

    throw new Error('Not implemented');
  }
}

export default Factory;

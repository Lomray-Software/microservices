import { BaseException } from '@lomray/microservice-nodejs-lib';
import type { S3 } from 'aws-sdk';
import type { ObjectCannedACL } from 'aws-sdk/clients/s3';
import type { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import Abstract from './abstract';

interface IS3StorageParams {
  s3: S3;
  bucketName: string;
  bucketAcl?: ObjectCannedACL;
  domain?: string;
}

/**
 * S3 Storage service
 */
class S3Storage extends Abstract {
  /**
   * @protected
   */
  protected s3: S3;

  /**
   * @protected
   */
  protected bucketName: string;

  /**
   * @protected
   */
  protected bucketAcl?: ObjectCannedACL;

  /**
   * @constructor
   */
  public constructor({ s3, bucketName, bucketAcl, domain }: IS3StorageParams) {
    super(domain);
    this.s3 = s3;
    this.bucketName = bucketName;
    this.bucketAcl = bucketAcl;
  }

  /**
   * Upload file to S3
   * @inheritDoc
   */
  public async upload(key: string, buffer: Buffer, mime: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ...(this.bucketAcl ? { ACL: this.bucketAcl } : {}),
      ContentType: mime,
    };

    await this.s3
      .upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
          throw new BaseException({
            status: 500,
            message: 'Failed to upload file.',
            payload: err,
          });
        }

        return data;
      })
      .promise();
  }

  /**
   * Delete files from S3 folder
   * @inheritDoc
   */
  public async delete(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Prefix: key,
    };

    const listedObjects = await this.s3.listObjectsV2(params).promise();

    if (!listedObjects || !listedObjects.Contents?.length) {
      return;
    }

    const deleteParams: S3.Types.DeleteObjectsRequest = {
      Bucket: this.bucketName,
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      Key && deleteParams.Delete.Objects.push({ Key });
    });

    await this.s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) {
      await this.delete(key);
    }
  }

  /**
   * @inheritDoc
   */
  public getDomain(): string {
    return this.domain || `https://${this.bucketName}.s3.amazonaws.com`;
  }
}

export default S3Storage;

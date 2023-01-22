import { RemoteConfig } from '@lomray/microservice-helpers';
import AWS from 'aws-sdk';
import type { S3 } from 'aws-sdk';

interface IS3AwsSdkOutput {
  s3: S3;
  bucketName: string;
  bucketAcl: string;
}

class S3AwsSdk {
  /**
   * @private
   */
  private static hasInit = false;

  /**
   * @private
   */
  private static s3: S3 | null;

  /**
   * @private
   */
  private static bucketName: string;

  /**
   * @private
   */
  private static bucketAcl: string;

  /**
   * Create/get AWS S3
   */
  public static async get(params: {
    isFromConfigMs?: boolean;
    options?: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
      bucketName?: string;
      bucketAcl?: string;
    };
  }): Promise<IS3AwsSdkOutput> {
    const { isFromConfigMs, options } = params;

    if (!this.hasInit) {
      let remoteConfig;

      if (isFromConfigMs) {
        remoteConfig = await RemoteConfig.get('aws', {
          isCommon: true,
        });

        this.bucketName = remoteConfig?.s3.bucketName;
        this.bucketAcl = remoteConfig?.s3.bucketAcl;
      }

      this.s3 = new AWS.S3({
        accessKeyId: remoteConfig?.accessKeyId || options?.accessKeyId,
        secretAccessKey: remoteConfig?.secretAccessKey || options?.secretAccessKey,
      });

      this.hasInit = true;
    }

    return {
      s3: this.s3!,
      bucketName: this.bucketName || options?.bucketName || '',
      bucketAcl: this.bucketAcl || options?.bucketAcl || '',
    };
  }

  /**
   * Reset instance
   */
  public static reset(): void {
    this.hasInit = false;
    this.bucketName = '';
    this.bucketAcl = '';
    this.s3 = null;
  }
}

export default S3AwsSdk;

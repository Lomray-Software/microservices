import { RemoteConfig } from '@lomray/microservice-helpers';
import AWS from 'aws-sdk';
import type { S3 } from 'aws-sdk';

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
  private static bucketName: string | null;

  /**
   * Create/get AWS S3
   */
  public static async get(params: {
    isFromConfigMs?: number;
    options?: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
      bucketName?: string;
    };
  }): Promise<any> {
    const { isFromConfigMs, options } = params;

    if (!this.hasInit) {
      let remoteConfig;

      if (isFromConfigMs) {
        remoteConfig = await RemoteConfig.get('aws', {
          isCommon: true,
        });

        this.bucketName = remoteConfig?.s3.bucketName;
      }

      this.s3 = new AWS.S3({
        accessKeyId: remoteConfig?.accessKeyId || options?.accessKeyId,
        secretAccessKey: remoteConfig?.secretAccessKey || options?.secretAccessKey,
      });

      this.hasInit = true;
    }

    return {
      s3: this.s3,
      bucketName: this.bucketName || options?.bucketName,
    };
  }

  /**
   * Reset instance
   */
  public static reset(): void {
    this.hasInit = false;
    this.bucketName = null;
    this.s3 = null;
  }
}

export default S3AwsSdk;

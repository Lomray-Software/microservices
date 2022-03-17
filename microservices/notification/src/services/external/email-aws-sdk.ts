import * as aws from '@aws-sdk/client-ses';
import { RemoteConfig } from '@lomray/microservice-helpers';
import nodemailer from 'nodemailer';

class EmailAwsSdk {
  /**
   * @private
   */
  private static hasInit = false;

  /**
   * @private
   */
  private static transporter: nodemailer.Transporter;

  /**
   * @private
   */
  private static defaultEmailFrom: string;

  /**
   * Create/get AWS nodemailer transporter
   */
  public static async get(params: {
    isFromConfigMs?: number;
    defaultFrom?: string;
    options?: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
    };
  }): Promise<{
    transporter: typeof EmailAwsSdk['transporter'];
    defaultEmailFrom: string;
  }> {
    if (!this.hasInit) {
      const { defaultFrom, isFromConfigMs, options } = params;

      let accessKeyId;
      let secretAccessKey;
      let region;
      let defaultEmailFrom;

      if (isFromConfigMs) {
        ({ defaultEmailFrom } = await RemoteConfig.get('emailTransportOptions'));
        ({ accessKeyId, secretAccessKey, region } = await RemoteConfig.get('aws', {
          isCommon: true,
        }));
      }

      const ses = new aws.SES({
        apiVersion: '2010-12-01',
        region: region || options?.region,
        credentials: {
          accessKeyId: accessKeyId || options?.accessKeyId,
          secretAccessKey: secretAccessKey || options?.secretAccessKey,
        },
      });

      this.transporter = nodemailer.createTransport({ SES: { ses, aws } });
      this.defaultEmailFrom = defaultEmailFrom || defaultFrom;
      this.hasInit = true;
    }

    return {
      transporter: this.transporter,
      defaultEmailFrom: this.defaultEmailFrom,
    };
  }

  /**
   * Reset instance
   */
  public static reset(): void {
    this.hasInit = false;
  }
}

export default EmailAwsSdk;

import { RemoteConfig } from '@lomray/microservice-helpers';
import nodemailer from 'nodemailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';

class EmailSimpleSdk {
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
   * Create/get simple nodemailer transporter
   */
  public static async get(
    params: {
      isFromConfigMs?: number;
      defaultFrom?: string;
      options?: string; // json string
    } = {},
  ): Promise<{
    transporter: typeof EmailSimpleSdk['transporter'];
    defaultEmailFrom: string;
  }> {
    if (!this.hasInit) {
      const { defaultFrom, isFromConfigMs, options = '{}' } = params;

      let transportOptions: SMTPConnection.Options;
      let defaultEmailFrom;

      if (isFromConfigMs) {
        ({ transportOptions, defaultEmailFrom } = await RemoteConfig.get('emailTransportOptions'));
      } else {
        transportOptions = JSON.parse(options);
      }

      this.transporter = nodemailer.createTransport(transportOptions);
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

export default EmailSimpleSdk;

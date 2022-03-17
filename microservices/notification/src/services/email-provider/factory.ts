import { Repository } from 'typeorm';
import EmailProvider from '@constants/email-provider';
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  EMAIL_DEFAULT_FROM,
  EMAIL_FROM_CONFIG_MS,
  EMAIL_TRANSPORTER_OPTIONS,
} from '@constants/index';
import Message from '@entities/message';
import EmailAwsSdk from '@services/external/email-aws-sdk';
import EmailSimpleSdk from '@services/external/email-simple-sdk';
import Abstract from './abstract';
import Nodemailer from './nodemailer';

/**
 * Email provider factory
 */
class Factory {
  /**
   * Create identity provider instance
   */
  public static async create(
    provider: EmailProvider | string,
    messageRepository: Repository<Message>,
  ): Promise<Abstract> {
    let transporter;
    let defaultEmailFrom;

    switch (provider) {
      case EmailProvider.SIMPLE:
        ({ transporter, defaultEmailFrom } = await EmailSimpleSdk.get({
          defaultFrom: EMAIL_DEFAULT_FROM,
          isFromConfigMs: EMAIL_FROM_CONFIG_MS,
          options: EMAIL_TRANSPORTER_OPTIONS,
        }));
        break;

      case EmailProvider.AWS_SES:
        ({ transporter, defaultEmailFrom } = await EmailAwsSdk.get({
          defaultFrom: EMAIL_DEFAULT_FROM,
          isFromConfigMs: EMAIL_FROM_CONFIG_MS,
          options: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION,
          },
        }));
        break;

      default:
        throw new Error(`Unknown email provider: ${provider}`);
    }

    return new Nodemailer(provider, transporter, messageRepository, { defaultEmailFrom });
  }
}

export default Factory;

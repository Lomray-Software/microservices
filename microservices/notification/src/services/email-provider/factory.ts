import { Repository } from 'typeorm';
import EmailProvider from '@constants/email-provider';
import CONST from '@constants/index';
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
          defaultFrom: CONST.EMAIL_DEFAULT_FROM,
          isFromConfigMs: CONST.IS_EMAIL_FROM_CONFIG_MS,
          options: CONST.EMAIL_TRANSPORTER_OPTIONS,
        }));
        break;

      case EmailProvider.AWS_SES:
        ({ transporter, defaultEmailFrom } = await EmailAwsSdk.get({
          defaultFrom: CONST.EMAIL_DEFAULT_FROM,
          isFromConfigMs: CONST.IS_EMAIL_FROM_CONFIG_MS,
          options: {
            accessKeyId: CONST.AWS.ACCESS_KEY_ID,
            secretAccessKey: CONST.AWS.SECRET_ACCESS_KEY,
            region: CONST.AWS.REGION,
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

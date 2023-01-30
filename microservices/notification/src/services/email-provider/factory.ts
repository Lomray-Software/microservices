import * as aws from '@aws-sdk/client-ses';
import { awsConfig } from '@lomray/microservice-helpers';
import nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import remoteConfig from '@config/remote';
import EmailProvider from '@constants/email-provider';
import CONST from '@constants/index';
import Message from '@entities/message';
import Abstract from './abstract';
import Nodemailer from './nodemailer';

/**
 * Email provider factory
 */
class Factory {
  /**
   * Create identity provider instance
   */
  public static async create(messageRepository: Repository<Message>): Promise<Abstract> {
    let transporter;

    const { emailProvider, defaultEmailFrom, transportOptions } = await remoteConfig();

    switch (emailProvider) {
      case EmailProvider.SIMPLE:
        transporter = nodemailer.createTransport(transportOptions);
        break;

      case EmailProvider.AWS_SES:
        const { accessKeyId, secretAccessKey, region } = await awsConfig(CONST);
        const ses = new aws.SES({
          apiVersion: '2010-12-01',
          region,
          credentials: {
            accessKeyId: accessKeyId!,
            secretAccessKey: secretAccessKey!,
          },
        });

        transporter = nodemailer.createTransport({ SES: { ses, aws } });
        break;

      default:
        throw new Error(`Unknown email provider: ${emailProvider as string}`);
    }

    return new Nodemailer(emailProvider, transporter, messageRepository, { defaultEmailFrom });
  }
}

export default Factory;

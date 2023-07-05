import nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import EmailProvider from '@constants/email-provider';
import Message from '@entities/message';
import type { IAttachment } from '@entities/message';

/**
 * Email params
 */
export interface IEmailParams {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
  attachments?: IAttachment[];
}

/**
 * Abstract class for email providers
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected readonly providerType: EmailProvider;

  /**
   * @protected
   */
  protected readonly transporter: nodemailer.Transporter;

  /**
   * @protected
   */
  protected readonly messageRepository: Repository<Message>;

  /**
   * @protected
   */
  protected readonly params: { defaultEmailFrom: string };

  /**
   * @constructor
   */
  public constructor(
    providerType: Abstract['providerType'],
    transporter: Abstract['transporter'],
    messageRepository: Abstract['messageRepository'],
    params: Abstract['params'],
  ) {
    this.providerType = providerType;
    this.transporter = transporter;
    this.messageRepository = messageRepository;
    this.params = params;
  }

  /**
   * Send email
   */
  public abstract send(params?: IEmailParams): Promise<boolean>;
}

export default Abstract;

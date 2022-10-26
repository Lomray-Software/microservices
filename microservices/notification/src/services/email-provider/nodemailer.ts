import { Log } from '@lomray/microservice-helpers';
import NotifyType from '@constants/notify-type';
import Abstract from './abstract';
import type { IEmailParams } from './abstract';

/**
 * Nodemailer email provider
 */
class Nodemailer extends Abstract {
  /**
   * @inheritDoc
   */
  public async send(params: IEmailParams): Promise<boolean> {
    const { defaultEmailFrom } = this.params;
    const { from = defaultEmailFrom, to, subject, text, html, replyTo } = params;

    const info = await this.transporter.sendMail({
      from,
      replyTo,
      to,
      subject,
      text,
      html,
    });

    Log.info(`Email message sent: ${to.join(', ')}`, info);

    const message = this.messageRepository.create({
      type: NotifyType.EMAIL,
      from,
      to: to.join(', '),
      text: text || html,
      subject,
      params: info,
    });

    await this.messageRepository.save(message);

    return true;
  }
}

export default Nodemailer;

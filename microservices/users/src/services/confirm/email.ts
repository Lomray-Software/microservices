import { Log } from '@lomray/microservice-helpers';
import Abstract from '@services/confirm/abstract';
import Api from '@services/external/api';

/**
 * Email confirmation service
 */
class Email extends Abstract {
  /**
   * @inheritDoc
   */
  public async send(email: string): Promise<boolean> {
    const code = this.generateCode();
    const [isSuccess] = await Promise.all([
      Email.sendEmail(email, code),
      this.saveCode(email, code),
    ]);

    return isSuccess;
  }

  /**
   * Send email with confirm code
   * @private
   */
  private static async sendEmail(email: string, code: string): Promise<boolean> {
    const result = await Api.notification.emailSend({
      to: email,
      subject: 'Email confirmation code.',
      text: `Your confirmation code is: ${code}`,
      html: `<p>Your confirmation code is: <strong>${code}</strong></p>`,
    });

    if (!result.getError()) {
      return true;
    }

    Log.error('Failed send confirmation email', result.getError());

    return false;
  }
}

export default Email;

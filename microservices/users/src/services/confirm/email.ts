import { Log, Api } from '@lomray/microservice-helpers';
import Abstract from '@services/confirm/abstract';

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
   * @protected
   */
  protected static async sendEmail(email: string, code: string): Promise<boolean> {
    const { error } = await Api.get().notification.email.send({
      to: [email],
      subject: 'Email confirmation code.',
      text: `Your confirmation code is: ${code}`,
      html: `<p>Your confirmation code is: <strong>${code}</strong></p>`,
    });

    if (!error) {
      return true;
    }

    Log.error('Failed send confirmation email', error);

    return false;
  }
}

export default Email;

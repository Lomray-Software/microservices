import { Log, Api } from '@lomray/microservice-helpers';
import Abstract from '@services/confirm/abstract';

/**
 * Phone confirmation service
 */
class Phone extends Abstract {
  /**
   * @inheritDoc
   */
  public async send(phone: string): Promise<boolean> {
    const code = this.generateCode();
    const [isSuccess] = await Promise.all([
      Phone.sendCode(phone, code),
      this.saveCode(phone, code),
    ]);

    return isSuccess;
  }

  /**
   * Send sms with confirm code
   * @private
   */
  protected static async sendCode(phone: string, code: string): Promise<boolean> {
    const { error } = await Api.get().notification.phone.send({
      to: [phone],
      message: `Confirmation code is: ${code}`,
    });

    if (!error) {
      return true;
    }

    Log.error('Failed send confirmation phone', error);

    return false;
  }
}

export default Phone;

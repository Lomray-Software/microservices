import { Log } from '@lomray/microservice-helpers';
import Abstract from '@services/confirm/abstract';
import Api from '@services/external/api';

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
  private static async sendCode(phone: string, code: string): Promise<boolean> {
    const result = await Api.notification.phone.send({
      to: [phone],
      message: `Confirmation code is: ${code}`,
    });

    if (!result.getError()) {
      return true;
    }

    Log.error('Failed send confirmation phone', result.getError());

    return false;
  }
}

export default Phone;

import { BaseException } from '@lomray/microservice-nodejs-lib';
import Abstract from './abstract';

class EmailAll extends Abstract {
  /**
   * Process email all users
   */
  public process(): Promise<boolean> {
    throw new BaseException({
      status: 501,
      message: 'Not implemented',
    });
  }
}

export default EmailAll;

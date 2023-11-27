import Abstract from './abstract';

class NoticeAll extends Abstract {
  /**
   * Process notice all users
   */
  public process(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export default NoticeAll;

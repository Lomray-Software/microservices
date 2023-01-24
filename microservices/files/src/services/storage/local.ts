import * as fs from 'fs';
import CONST from '@constants/index';
import Abstract from './abstract';

/**
 * Local storage service
 */
class LocalStorage extends Abstract {
  /**
   * @constructor
   */
  public constructor() {
    super();
  }

  /**
   * Save file locally
   * @inheritDoc
   */
  public upload(key: string, buffer: Buffer): void {
    const [folder, file] = key.split('/');
    const path = `${CONST.LOCAL_STORAGE_PATH}/${folder}`;

    if (!fs.existsSync(path)) {
      fs.mkdirSync(`${path}`, { recursive: true });
    }

    fs.writeFileSync(`${path}/${file}`, buffer, 'base64');
  }

  /**
   * Delete files from local folder
   * @inheritDoc
   */
  public delete(path: string): void {
    fs.rmSync(path, { recursive: true, force: true });
  }
}

export default LocalStorage;

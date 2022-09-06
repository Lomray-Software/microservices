import * as fs from 'fs';
import { LOCAL_STORAGE_PATH } from '@constants/index';
import Abstract from './abstract';

/**
 * S3 Storage service
 */
class LocalStorage extends Abstract {
  /**
   * @constructor
   */
  public constructor() {
    super();
  }

  /**
   * Upload file to S3
   * @inheritDoc
   */
  public upload(key: string, buffer: Buffer): void {
    const [folder, file] = key.split('/');
    const path = `${LOCAL_STORAGE_PATH}/${folder}`;

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

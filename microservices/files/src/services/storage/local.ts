import * as fs from 'fs';
import remoteConfig from '@config/remote';
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
  public async upload(key: string, buffer: Buffer): Promise<void> {
    const { localStoragePath } = await remoteConfig();
    const [folder, file] = key.split('/');
    const path = `${localStoragePath!}/${folder}`;

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

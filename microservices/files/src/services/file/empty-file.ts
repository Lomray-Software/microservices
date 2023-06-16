import path from 'path';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import mime from 'mime-types';
import File from '@entities/file';
import Abstract from './abstract';

/**
 * Empty file
 */
class EmptyFile extends Abstract {
  /**
   * Save empty file
   * @inheritDoc
   */
  public save(fileName: string, userId?: string, alt?: string): Promise<File> {
    return this.manager.transaction(async (transactionManager) => {
      const fileRepository = transactionManager.getRepository(File);
      const fileEntity = await fileRepository.save(
        fileRepository.create({ userId, alt, url: '/', type: this.type }),
        { listeners: false },
      );

      const { fileData } = this.composeData(fileName, fileEntity.id);

      return fileRepository.save({ ...fileEntity, ...fileData });
    });
  }

  /**
   * Compose data
   * @private
   */
  private composeData(fileName: string, id: string): { fileData: Partial<File> } {
    const ext = path.extname(fileName).replace('.', '');

    if (!ext) {
      throw new BaseException({
        status: 422,
        message: 'Invalid file format.',
      });
    }

    const fileUrl = this.getFilePath(id, 'origin', ext);
    const fileMime = mime.lookup(ext) || 'unknown';

    return {
      fileData: {
        url: `/${fileUrl}`,
        type: this.type,
        meta: {
          mime: fileMime,
        },
      },
    };
  }

  /**
   * @inheritDoc
   */
  public update(): Promise<File> {
    throw new Error('Use files.file.update instead.');
  }

  /**
   * @inheritDoc
   */
  public remove(): Promise<boolean> {
    throw new Error('Use files.file.remove instead.');
  }
}

export default EmptyFile;

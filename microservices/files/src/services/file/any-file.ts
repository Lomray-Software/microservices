import { BaseException } from '@lomray/microservice-nodejs-lib';
import { fromBuffer } from 'file-type';
import Mime from 'mime';
import File from '@entities/file';
import Abstract from './abstract';

interface IUploadFile {
  buffer: Buffer;
  url: string;
  fileMime: string;
}

/**
 * Any file
 */
class AnyFile extends Abstract {
  /**
   * Save file to storage
   * @inheritDoc
   */
  public save(file: string, userId: string, alt?: string): Promise<File> {
    return this.manager.transaction(async (transactionManager) => {
      const fileRepository = transactionManager.getRepository(File);
      const fileEntity = await fileRepository.save(
        fileRepository.create({ userId, alt, url: '/', type: this.type }),
      );

      const { fileData, fileBuffer } = await this.composeData(file, fileEntity.id);

      await this.uploadFile(fileBuffer);

      return fileRepository.save({ ...fileEntity, ...fileData });
    });
  }

  /**
   * Update file
   * @inheritDoc
   */
  public async update(fileEntity: File, file?: string, alt?: string): Promise<File> {
    const { id } = fileEntity;
    let fileData;
    let fileBuffer;

    if (file) {
      ({ fileData, fileBuffer } = await this.composeData(file, id));

      await this.storage.delete(this.getFilePath(id));
      await this.uploadFile(fileBuffer);
    }

    return this.fileRepository.save({
      ...fileEntity,
      ...(fileData && { ...fileData }),
      ...(alt && { alt }),
    });
  }

  /**
   * Delete file
   * @inheritDoc
   */
  public async remove(file: File): Promise<boolean> {
    const { id } = file;

    if (!id) {
      return false;
    }

    await this.fileRepository.remove(file);
    await this.storage.delete(this.getFilePath(id));

    return true;
  }

  /**
   * Compose data
   * @private
   */
  private async composeData(
    file: string,
    id: string,
  ): Promise<{ fileData: Partial<File>; fileBuffer: IUploadFile }> {
    const fileBuffer = Buffer.from(file.replace(/^data:.+;base64,/, ''), 'base64');
    const { ext, mime: detectedMime } = (await fromBuffer(fileBuffer)) ?? {};

    if (!ext) {
      throw new BaseException({
        status: 422,
        message: 'Invalid file format.',
      });
    }

    const fileUrl = this.getFilePath(id, 'origin', ext);
    const fileMime = detectedMime || Mime.getType(ext) || 'unknown';

    return {
      fileData: {
        url: `/${fileUrl}`,
        type: this.type,
        meta: {
          mime: fileMime,
        },
      },
      fileBuffer: { buffer: fileBuffer, url: fileUrl, fileMime },
    };
  }

  /**
   * Upload file to storage
   * @private
   */
  private async uploadFile({ url, buffer, fileMime }: IUploadFile): Promise<void> {
    await this.storage.upload(url, buffer, fileMime);
  }
}

export default AnyFile;

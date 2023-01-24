import CONST from '@constants/index';
import File from '@entities/file';
import type { IImageFormat } from '@entities/file';
import FileEntity from '@entities/file-entity';
import StorageFactory from '@services/storage/factory';

interface IFileDomainOptions extends Record<string, any> {
  // return only specified formats
  onlyFormats?: string[];
}

class FilePostProcess {
  /**
   * Make some actions before return file to client:
   * E.g. add domain to the url of the file and to the url of its formats
   */
  public static async handle(entity: File, options: IFileDomainOptions = {}): Promise<File> {
    const storage = await StorageFactory.create(CONST.MS_STORAGE_TYPE);
    const { onlyFormats } = options;

    if (entity.url) {
      entity.url = storage.handleUrl(entity.url);
    }

    const formats: IImageFormat = {};

    for (const format in entity.formats) {
      if (Array.isArray(onlyFormats) && !onlyFormats.includes(format)) {
        continue;
      }

      formats[format] = {
        ...format[format],
        url: storage.handleUrl(entity.formats[format].url),
      };
    }

    entity.formats = formats;

    return entity;
  }

  /**
   * Make some actions before return file entity to client:
   * E.g. add domain to the url of the file entity "file" relation
   */
  public static async handleRelation(
    entity: FileEntity,
    options: IFileDomainOptions = {},
  ): Promise<FileEntity> {
    if (entity.file) {
      entity.file = await FilePostProcess.handle(entity.file, options);
    }

    return entity;
  }

  /**
   * Make some actions before return files to client
   */
  public static async handleMultiple(
    entities: File[],
    options: IFileDomainOptions = {},
  ): Promise<File[]> {
    const result = [];

    for (const entity of entities) {
      result.push(await FilePostProcess.handle(entity, options));
    }

    return result;
  }

  /**
   * Make some actions before return files entities to client
   */
  public static async handleMultipleRelations(
    entities: FileEntity[],
    options: IFileDomainOptions = {},
  ): Promise<FileEntity[]> {
    const result = [];

    for (const entity of entities) {
      result.push(await FilePostProcess.handleRelation(entity, options));
    }

    return result;
  }
}

export default FilePostProcess;

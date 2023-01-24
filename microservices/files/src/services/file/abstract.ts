import type { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import FileType from '@constants/file-type';
import CONST from '@constants/index';
import File from '@entities/file';
import type { IImageProcessingConfig } from '@services/external/image-processing-config';
import type StorageAbstract from '@services/storage/abstract';

/**
 * Abstract class for file providers
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected readonly type: FileType;

  /**
   * @protected
   */
  protected readonly manager: EntityManager;

  /**
   * @protected
   */
  protected readonly storage: StorageAbstract;

  /**
   * @protected
   */
  protected config: IImageProcessingConfig;

  /**
   * @protected
   */
  protected fileRepository: Repository<File>;

  /**
   * @constructor
   */
  public constructor(
    type: FileType,
    manager: EntityManager,
    storage: StorageAbstract,
    config: IImageProcessingConfig,
  ) {
    this.type = type;
    this.manager = manager;
    this.storage = storage;
    this.config = config;
    this.fileRepository = manager.getRepository(File);
  }

  /**
   * Save file
   */
  public abstract save(file: string, userId: string, alt?: string): Promise<File>;

  /**
   * Update file
   */
  public abstract update(fileEntity: File, file?: string, alt?: string): Promise<File>;

  /**
   * Remove file
   */
  public abstract remove(file: File): Promise<boolean>;

  /**
   * Get correct storage path
   */
  protected getFilePath = (id: string, name?: string, extension?: string): string => {
    const pathPrefix = [CONST.STORAGE_PATH_PREFIX, id].filter(Boolean).join('/');

    return [pathPrefix, name && extension && `${name}_${v4()}.${extension}`]
      .filter(Boolean)
      .join('/');
  };
}

export default Abstract;

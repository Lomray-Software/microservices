import type { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import AttachmentType from '@constants/attachment-type';
import { STORAGE_PATH_PREFIX } from '@constants/index';
import Attachment from '@entities/attachment';
import type { IImageProcessingConfig } from '@services/external/image-processing-config';
import type StorageAbstract from '@services/storage/abstract';

/**
 * Abstract class for attachment providers
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected readonly type: AttachmentType;

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
  protected attachmentRepository: Repository<Attachment>;

  /**
   * @constructor
   */
  public constructor(
    type: AttachmentType,
    manager: EntityManager,
    storage: StorageAbstract,
    config: IImageProcessingConfig,
  ) {
    this.type = type;
    this.manager = manager;
    this.storage = storage;
    this.config = config;
    this.attachmentRepository = manager.getRepository(Attachment);
  }

  /**
   * Save attachment
   */
  public abstract save(file: string, userId: string, alt?: string): Promise<Attachment>;

  /**
   * Update attachment
   */
  public abstract update(
    id: string,
    file: string,
    attachment: Attachment,
    alt?: string,
  ): Promise<Attachment>;

  /**
   * Remove attachment
   */
  public abstract remove(id: string): Promise<boolean>;

  /**
   * Get correct storage path
   */
  protected getFilePath = (id: string, name?: string, extension?: string): string => {
    const pathPrefix = [STORAGE_PATH_PREFIX, id].filter(Boolean).join('/');

    return [pathPrefix, name && extension && `${name}_${v4()}.${extension}`]
      .filter(Boolean)
      .join('/');
  };
}

export default Abstract;

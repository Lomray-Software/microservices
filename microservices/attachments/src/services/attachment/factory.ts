import { EntityManager } from 'typeorm';
import AttachmentType from '@constants/attachment-type';
import {
  IMAGE_CONFIG_FROM_CONFIG_MS,
  IMAGE_PROCESSING_CONFIG,
  MS_STORAGE_TYPE,
} from '@constants/index';
import ImageProcessingConfig from '@services/external/image-processing-config';
import StorageFactory from '@services/storage/factory';
import Abstract from './abstract';
import Image from './image';

/**
 * Attachment factory
 */
class Factory {
  /**
   * Create attachment type instance
   */
  public static async create(type: AttachmentType, manager: EntityManager): Promise<Abstract> {
    const storage = await StorageFactory.create(MS_STORAGE_TYPE);
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: IMAGE_CONFIG_FROM_CONFIG_MS,
      config: IMAGE_PROCESSING_CONFIG,
    });

    switch (type) {
      case AttachmentType.image:
        return new Image(type, manager, storage, config);

      case AttachmentType.video:
      case AttachmentType.file:
      default:
        throw new Error('Not implemented');
    }
  }
}

export default Factory;

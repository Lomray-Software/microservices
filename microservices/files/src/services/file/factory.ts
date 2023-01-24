import { EntityManager } from 'typeorm';
import FileType from '@constants/file-type';
import CONST from '@constants/index';
import ImageProcessingConfig from '@services/external/image-processing-config';
import StorageFactory from '@services/storage/factory';
import Abstract from './abstract';
import Image from './image';

/**
 * File factory
 */
class Factory {
  /**
   * Create file type instance
   */
  public static async create(type: FileType, manager: EntityManager): Promise<Abstract> {
    const storage = await StorageFactory.create(CONST.MS_STORAGE_TYPE);
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: CONST.IS_IMAGE_CONFIG_FROM_CONFIG_MS,
      config: CONST.IMAGE_PROCESSING_CONFIG,
    });

    switch (type) {
      case FileType.image:
        return new Image(type, manager, storage, config);

      case FileType.video:
      case FileType.file:
      default:
        throw new Error('Not implemented');
    }
  }
}

export default Factory;

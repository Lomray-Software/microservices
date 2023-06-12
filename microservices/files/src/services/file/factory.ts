import { RemoteConfig } from '@lomray/microservice-helpers';
import { EntityManager } from 'typeorm';
import FileType from '@constants/file-type';
import { IRemoteConfig } from '@interfaces/remote-config';
import StorageFactory from '@services/storage/factory';
import Abstract from './abstract';
import AnyFile from './any-file';
import Image from './image';

/**
 * File factory
 */
class Factory {
  /**
   * Create file type instance
   */
  public static async create(type: FileType, manager: EntityManager): Promise<Abstract> {
    const storage = await StorageFactory.create();
    const config = await RemoteConfig.get<IRemoteConfig>('config');

    switch (type) {
      case FileType.image:
        return new Image(type, manager, storage, config);

      case FileType.video:
      case FileType.file:
      default:
        return new AnyFile(type, manager, storage, config);
    }
  }
}

export default Factory;

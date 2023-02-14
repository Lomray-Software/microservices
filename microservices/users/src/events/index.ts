import type { Microservice } from '@lomray/microservice-nodejs-lib';
import FilesEvent from '@lomray/microservices-client-api/constants/events/files';
import FileEntityChanged from '@events/user/file-entity-changed';
import FileChanged from '@events/user/file-removed';

/**
 * Register events
 */
export default (ms: Microservice): void => {
  /**
   * Event handler for file
   */
  ms.addEventHandler(FilesEvent.FileRemove, FileChanged);

  /**
   * Event handler for file entity
   */
  ms.addEventHandler(FilesEvent.FileEntityCreate, FileEntityChanged);
  ms.addEventHandler(FilesEvent.FileEntityUpdate, FileEntityChanged);
  ms.addEventHandler(FilesEvent.FileEntityRemove, FileEntityChanged);
};

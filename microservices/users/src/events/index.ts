import type { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@constants/event';
import FileEntityChanged from '@events/user/file-entity-changed';
import FileChanged from '@events/user/file-removed';

/**
 * Register events
 */
export default (ms: Microservice): void => {
  /**
   * Event handler for file
   */
  ms.addEventHandler(Event.FileRemove, FileChanged);

  /**
   * Event handler for file entity
   */
  ms.addEventHandler(Event.FileEntityCreate, FileEntityChanged);
  ms.addEventHandler(Event.FileEntityUpdate, FileEntityChanged);
  ms.addEventHandler(Event.FileEntityRemove, FileEntityChanged);
};

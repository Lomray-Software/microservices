import type { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@constants/event';
import AttachmentEntityChanged from '@events/attachments/attachment-entity/changed';

/**
 * Register events
 */
export default (ms: Microservice): void => {
  /**
   * Event handler for attachment entity
   */
  ms.addEventHandler(Event.AttachmentEntityCreate, AttachmentEntityChanged);
  ms.addEventHandler(Event.AttachmentEntityUpdate, AttachmentEntityChanged);
  ms.addEventHandler(Event.AttachmentEntityRemove, AttachmentEntityChanged);
};

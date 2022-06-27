import type { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@constants/event';
import AttachmentEntityChanged from '@events/user/attachment-entity-changed';
import AttachmentChanged from '@events/user/attachment-removed';

/**
 * Register events
 */
export default (ms: Microservice): void => {
  /**
   * Event handler for attachment
   */
  ms.addEventHandler(Event.AttachmentRemove, AttachmentChanged);

  /**
   * Event handler for attachment entity
   */
  ms.addEventHandler(Event.AttachmentEntityCreate, AttachmentEntityChanged);
  ms.addEventHandler(Event.AttachmentEntityUpdate, AttachmentEntityChanged);
  ms.addEventHandler(Event.AttachmentEntityRemove, AttachmentEntityChanged);
};

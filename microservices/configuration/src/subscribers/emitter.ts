/* eslint-disable @typescript-eslint/no-unused-vars */
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';

/**
 * Emit CRUD entities actions to job server
 */
@EventSubscriber()
class Emitter implements EntitySubscriberInterface {
  afterInsert(event: InsertEvent<any>): Promise<any> | void {
    // @TODO implement emit request to job server
  }

  afterUpdate(event: UpdateEvent<any>): Promise<any> | void {
    // @TODO implement emit request to job server
  }

  afterRemove(event: RemoveEvent<any>): Promise<any> | void {
    // @TODO implement emit request to job server
  }
}

export default Emitter;

import type { InsertEvent, QueryRunner, UpdateEvent } from 'typeorm';
import { TypeormMock } from '@mocks/index';

const subscriptionEvent = (): Record<string, any> => ({
  manager: TypeormMock.entityManager,
  connection: TypeormMock.entityManager.connection,
  queryRunner: TypeormMock.entityManager.queryRunner as QueryRunner,
  metadata: TypeormMock.mock.metadata,
});

const subscriptionEventInsert = <TEntity = Record<string, any>>(): InsertEvent<TEntity> => ({
  ...subscriptionEvent(),
  // @ts-ignore
  entity: {},
});

const subscriptionEventUpdate = <TEntity = Record<string, any>>(): UpdateEvent<TEntity> => ({
  ...subscriptionEvent(),
  // @ts-ignore
  entity: {},
  // @ts-ignore
  databaseEntity: {},
  updatedColumns: [],
  updatedRelations: [],
});

export { subscriptionEvent, subscriptionEventInsert, subscriptionEventUpdate };

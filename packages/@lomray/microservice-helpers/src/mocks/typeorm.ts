import _ from 'lodash';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import {
  getConnectionManager,
  EntityManager,
  getMetadataArgsStorage,
  EntityRepository,
  Entity,
} from 'typeorm';
import { EntitySchema } from 'typeorm/entity-schema/EntitySchema';

const sandbox = sinon.createSandbox();

/**
 * Replace entity manager methods with stub methods
 * (prevent trying create connection and original requests to database)
 */
class EntityManagerMock extends EntityManager {
  save = sandbox.stub();
}

// Create fake connection
const fakeConnection = getConnectionManager().create({
  type: 'postgres',
  entities: ['src/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  synchronize: true,
  logging: false,
});
const entityManager = new EntityManagerMock(fakeConnection);

// @ts-ignore
fakeConnection.buildMetadatas();

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
const prevFindMetaData = fakeConnection.findMetadata;

// @ts-ignore
fakeConnection.findMetadata = function (target) {
  let metadata = prevFindMetaData.call(fakeConnection, target);

  /**
   * We need this implementation because when tests run with --watch flag,
   * every rerun tests add new entities to 'getMetadataArgsStorage'
   * and we lose links to class
   */
  if (!metadata) {
    metadata = this.entityMetadatas.find(
      (md) =>
        // @ts-ignore
        md.target.name === target.name,
    );
  }

  return metadata;
};

// Mock entity manager for fake connection
sandbox.stub(fakeConnection, 'manager').value(entityManager);

const stubs = {
  createConnection: sandbox.stub().resolves(fakeConnection),
  getCustomRepository: sandbox.stub(),
  /**
   * We need this implementation because when tests run with --watch flag,
   * every rerun tests add new entities to 'getMetadataArgsStorage'
   * and we prevent memory leak
   */
  EntityRepository: (entity?: () => void | EntitySchema): ClassDecorator => {
    const { entityRepositories } = getMetadataArgsStorage();
    const existEntityIndex = _.findIndex(entityRepositories, { entity });

    if (existEntityIndex) {
      entityRepositories.splice(existEntityIndex, 1);
    }

    return EntityRepository(entity);
  },
  /**
   * We need this implementation because when tests run with --watch flag,
   * every rerun tests add new entities to 'getMetadataArgsStorage'
   * and we prevent memory leak
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  Entity: (nameOrOptions: any, maybeOptions: any): ClassDecorator => {
    const { tables } = getMetadataArgsStorage();
    const options = (typeof nameOrOptions === 'object' ? nameOrOptions : maybeOptions) || {};
    const name = typeof nameOrOptions === 'string' ? nameOrOptions : options.name;
    const existEntityIndex = _.findIndex(tables, { name });

    if (existEntityIndex) {
      tables.splice(existEntityIndex, 1);
    }

    return Entity(nameOrOptions, maybeOptions);
  },
};

const TypeormMock = {
  sandbox,
  stubs,
  entityManager,
  mock: rewiremock('typeorm').callThrough().with(stubs) as any,
};

export default TypeormMock;

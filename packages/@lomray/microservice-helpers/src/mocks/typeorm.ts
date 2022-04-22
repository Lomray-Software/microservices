import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { getConnectionManager, EntityManager, SelectQueryBuilder } from 'typeorm';

const sandbox = sinon.createSandbox();

/**
 * Replace entity manager methods with stub methods
 * (prevent trying to create connection and original requests to database)
 */
class EntityManagerMock extends EntityManager {
  queryBuilders: SelectQueryBuilder<any>[] = [];

  stubReturns() {
    this.save = sandbox.stub().callsFake((__, entities) => {
      if (Array.isArray(entities)) {
        return [{}];
      }

      return {};
    });
    this.increment = sandbox.stub().resolves({ affected: 0, generatedMaps: [] });
    this.decrement = sandbox.stub().resolves({ affected: 0, generatedMaps: [] });
    this.update = sandbox.stub().resolves({ affected: 0, generatedMaps: [] });
    this.count = sandbox.stub().resolves(0);
    this.find = sandbox.stub().resolves({});
    this.findOne = sandbox.stub().resolves({});
    this.findByIds = sandbox.stub().resolves([]);
    this.delete = sandbox.stub().resolves({ affected: 0 });
    this.restore = sandbox.stub().resolves({ affected: 0, generatedMaps: [] });
    this.recover = sandbox.stub().resolves([]);
    this.remove = sandbox.stub().resolves({});
    this.softRemove = sandbox.stub().resolves({});
    this.softDelete = sandbox.stub().resolves({ affected: 0, generatedMaps: [] });
    this.upsert = sandbox.stub().resolves({ identifiers: [], generatedMaps: [] });

    this.transaction = (...args: any) => args?.[1]?.(this) ?? args?.[0](this);
    this.getRepository = sandbox.stub().callsFake((repo) => super.getRepository(repo));
    this.getCustomRepository = sandbox.stub().callsFake((repo) => super.getCustomRepository(repo));
    this.createQueryBuilder = sandbox.stub().callsFake((...args) => {
      const qb = super.createQueryBuilder(...args);

      this.queryBuilders.push(qb);

      return qb;
    });
  }

  // @ts-ignore
  constructor(...args) {
    // @ts-ignore
    super(...args);
    this.stubReturns();
  }

  reset(shouldKeepBuilders = false) {
    if (!shouldKeepBuilders) {
      this.queryBuilders = [];
    }

    this.stubReturns();
  }
}

// Create fake connection
const fakeConnection = getConnectionManager().create({
  type: 'postgres',
  entities: ['src/entities/*.ts', '__mocks__/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  synchronize: true,
  logging: false,
});

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

const queryBuilderUpdateMock = () =>
  ({
    execute: { affected: 0, generatedMaps: [] },
  } as const);

const queryBuilderMock = () =>
  ({
    getManyAndCount: [[], 0],
    getMany: [],
    getCount: 0,
    getOne: {},
    getOneOrFail: {},
    getRawMany: [],
    getRawOne: {},
    insert: { identifiers: [], generatedMaps: [] },
    execute: {},
  } as const);

const queryBuilder = Object.entries(queryBuilderMock()).reduce(
  (res, [method, value]) => ({ ...res, [method]: sandbox.stub().resolves(value) }),
  {},
) as { [key in keyof ReturnType<typeof queryBuilderMock>]: sinon.SinonStub };

const queryUpdateBuilder = Object.entries(queryBuilderUpdateMock()).reduce(
  (res, [method, value]) => ({ ...res, [method]: sandbox.stub().resolves(value) }),
  {},
) as { [key in keyof ReturnType<typeof queryBuilderUpdateMock>]: sinon.SinonStub };

// eslint-disable-next-line @typescript-eslint/unbound-method
const prevCreateQueryBuilder = fakeConnection.createQueryBuilder;

// @ts-ignore
fakeConnection.createQueryBuilder = function (...args) {
  const qb = Object.assign(prevCreateQueryBuilder.call(fakeConnection, ...args), queryBuilder);
  const qbPrevUpdate = qb.update;
  // @ts-ignore
  const mockUpdate = (...args2) =>
    Object.assign(qbPrevUpdate.call(qb, ...args2), queryUpdateBuilder);

  qb.update = mockUpdate;
  qb.clone = () =>
    Object.assign(prevCreateQueryBuilder.call(fakeConnection, ...args), queryBuilder, {
      update: mockUpdate,
    });

  return qb;
};

type TEntityManagerMock = InstanceType<typeof EntityManagerMock>;

const entityManager = new EntityManagerMock(fakeConnection) as EntityManagerMock & {
  [key in keyof TEntityManagerMock]: TEntityManagerMock[key] extends (...args: any[]) => any
    ? sinon.SinonStub
    : TEntityManagerMock[key];
};

sandbox.stub(fakeConnection, 'manager').value(entityManager);

const stubs = {
  createConnection: sandbox.stub().resolves(fakeConnection),
};

const prevReset = sandbox.reset.bind(sandbox);

sandbox.reset = () => {
  prevReset();
  stubs.createConnection.resolves(fakeConnection);
  sandbox.stub(fakeConnection, 'manager').value(entityManager);
  entityManager.reset();

  const qbMock = queryBuilderMock();
  const qbMockUpdate = queryBuilderUpdateMock();

  Object.entries(queryBuilder).forEach(([method, stub]) => {
    stub.resolves(qbMock[method]);
  });
  Object.entries(queryUpdateBuilder).forEach(([method, stub]) => {
    stub.resolves(qbMockUpdate[method]);
  });
};

const Typeorm = {
  sandbox,
  stubs,
  entityManager,
  queryBuilder,
  queryUpdateBuilder,
  mock: rewiremock('typeorm').callThrough().with(stubs) as any,
};

export default Typeorm;

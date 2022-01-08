/* eslint-disable @typescript-eslint/unbound-method */
import { expect } from 'chai';
import sinon from 'sinon';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import TestEntity from '@__mocks__/entities/test-entity';
import { TypeormMock } from '@mocks/index';
import CRUD from '@services/crud';
import {
  countResult,
  removeResult,
  endpointOptions,
  listResult,
  shouldNotCall,
  restoreResult,
} from '@test-helpers/mock-args';
import waitResult from '@test-helpers/wait-result';

describe('services/crud', () => {
  const sandbox = sinon.createSandbox();
  const handler = sandbox.stub();
  const entity = { id: 1, param: 'test' };
  const repository = TypeormMock.entityManager.getRepository(TestEntity);
  const emptyConditionMessage = 'condition is empty';
  const entityNotFoundMessage = 'entity not found';

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  describe('count', () => {
    const countHandler = CRUD.count?.(() => ({ repository }), handler);
    const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'count').resolves(countResult());

    beforeEach(() => {
      defaultHandlerStub.resetHistory();
    });

    it('should run default count handler with query builder: typeorm case', async () => {
      const countWithDefaultHandler = CRUD.count?.(() => ({ repository }));

      const result = await countWithDefaultHandler(
        { hasRemoved: true, payload: { authorization: {} } },
        endpointOptions,
      );
      const [queryBuilder, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(hasRemoved).to.be.ok;
      expect(result).to.deep.equal(countResult());
    });

    it('should run default count handler with query builder: query builder case', async () => {
      // return query builder from handler
      handler.callsFake((query) => query.toQuery());

      const result = await countHandler({ hasRemoved: true }, endpointOptions);
      const [queryBuilder, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(hasRemoved).to.be.ok;
      expect(result).to.deep.equal(countResult());
    });

    it('should run default count handler with query builder: params typeorm case', async () => {
      // return typeorm from handler
      handler.callsFake((query) => ({ query, payloadParam: 1 }));

      const result = await countHandler({ hasRemoved: true }, endpointOptions);
      const [queryBuilder, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(hasRemoved).to.be.ok;
      expect(result).to.deep.equal({ ...countResult(), payloadParam: 1 });
    });

    it('should run default count handler with query builder: params query builder case', async () => {
      // return query builder from handler
      handler.callsFake((query) => ({ query: query.toQuery(), payloadParam: 1 }));

      const result = await countHandler({ hasRemoved: true }, endpointOptions);
      const [queryBuilder, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(hasRemoved).to.be.ok;
      expect(result).to.deep.equal({ ...countResult(), payloadParam: 1 });
    });

    it('should return custom result: count', async () => {
      // return query builder from handler
      handler.callsFake(() => ({ ...countResult(), payloadParam: 1 }));

      const result = await countHandler({}, endpointOptions);

      expect(result).to.deep.equal({ ...countResult(), payloadParam: 1 });
    });

    it('handler - should return count entities without removed: default handler', async () => {
      defaultHandlerStub.restore();

      const result = await CRUD.defaultHandler.count(repository.createQueryBuilder());

      expect(TypeormMock.queryBuilder.getCount).to.be.calledOnce;
      expect(result).to.deep.equal({ count: 0 });
    });

    it('handler - should return count entities with removed: default handler', async () => {
      const qb = repository.createQueryBuilder();
      const withDeletedSpy = sandbox.spy(qb, 'withDeleted');
      const result = await CRUD.defaultHandler.count(qb, true);

      expect(withDeletedSpy).to.be.calledOnce;
      expect(TypeormMock.queryBuilder.getCount).to.be.calledOnce;
      expect(result).to.deep.equal({ count: 0 });
    });
  });

  describe('list', () => {
    const listHandler = CRUD.list?.(() => ({ repository }), handler);
    const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'list').resolves(listResult());

    beforeEach(() => {
      defaultHandlerStub.resetHistory();
    });

    it('should run default list handler with query builder: typeorm case', async () => {
      const listWithDefaultHandler = CRUD.list?.(() => ({ repository, isListWithCount: false }));

      const result = await listWithDefaultHandler({ hasRemoved: true }, endpointOptions);
      const [queryBuilder, isListWithCount, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(isListWithCount).to.be.false;
      expect(hasRemoved).to.be.ok;
      expect(result).to.deep.equal(listResult());
    });

    it('should run default list handler with query builder: query builder case', async () => {
      // return query builder from handler
      handler.callsFake((query) => query.toQuery());

      const result = await listHandler({}, endpointOptions);
      const [queryBuilder, isListWithCount, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(isListWithCount).to.be.ok;
      expect(hasRemoved).to.be.undefined;
      expect(result).to.deep.equal(listResult());
    });

    it('should run default list handler with query builder: params typeorm case', async () => {
      // return typeorm from handler
      handler.callsFake((query) => ({ query, payloadParam: 1 }));

      const result = await listHandler({}, endpointOptions);
      const [queryBuilder, isListWithCount, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(isListWithCount).to.be.ok;
      expect(hasRemoved).to.be.undefined;
      expect(result).to.deep.equal({ ...listResult(), payloadParam: 1 });
    });

    it('should run default list handler with query builder: params query builder case', async () => {
      // return query builder from handler
      handler.callsFake((query) => ({ query: query.toQuery(), payloadParam: 1 }));

      const result = await listHandler({}, endpointOptions);
      const [queryBuilder, isListWithCount, hasRemoved] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(isListWithCount).to.be.ok;
      expect(hasRemoved).to.be.undefined;
      expect(result).to.deep.equal({ ...listResult(), payloadParam: 1 });
    });

    it('should return custom result', async () => {
      // return query builder from handler
      handler.callsFake(() => ({ ...listResult(), payloadParam: 1 }));

      const result = await listHandler({}, endpointOptions);

      expect(result).to.deep.equal({ ...listResult(), payloadParam: 1 });
    });

    it("should throw error if custom result don't return 'list'", async () => {
      handler.callsFake(() => ({ ...listResult(), payloadParam: 1, list: undefined }));

      const result = listHandler({}, endpointOptions);

      expect(await waitResult(result)).to.throw('Internal error: property "list"');
    });

    it("should throw error if custom result don't return 'count'", async () => {
      handler.callsFake(() => ({ ...listResult(), payloadParam: 1, count: undefined }));

      const result = listHandler({}, endpointOptions);

      expect(await waitResult(result)).to.throw('Internal error: property "count"');
    });

    it('handler - should return list entities without removed & without count: default handler', async () => {
      defaultHandlerStub.restore();

      const result = await CRUD.defaultHandler.list(repository.createQueryBuilder(), false);

      expect(TypeormMock.queryBuilder.getMany).to.be.calledOnce;
      expect(result).to.deep.equal({ list: [] });
    });

    it('handler - should return list entities with removed & with count: default handler', async () => {
      const qb = repository.createQueryBuilder();
      const withDeletedSpy = sandbox.spy(qb, 'withDeleted');

      const result = await CRUD.defaultHandler.list(qb, true, true);

      expect(withDeletedSpy).to.be.calledOnce;
      expect(TypeormMock.queryBuilder.getManyAndCount).to.be.calledOnce;
      expect(result).to.deep.equal({ list: [], count: 0 });
    });
  });

  describe('create', () => {
    const entityFields = { param: 'world' };
    const reqParams = { fields: entityFields, param: 1 };

    it('should call custom handler with fields', async () => {
      const customHandler = sandbox
        .stub<Record<string, any>[], TestEntity>()
        .callsFake((reqEntityFields) => ({ ...reqEntityFields, id: 1 } as TestEntity));
      const createWithCustomHandler = CRUD.create?.(() => ({ repository }), customHandler);

      const result = await createWithCustomHandler(reqParams, endpointOptions);
      const [fields, params, options] = customHandler.firstCall.args;

      expect(result).to.deep.equal({ ...entityFields, id: 1 });
      expect(fields).to.deep.equal(entityFields);
      expect(params).to.deep.equal(reqParams);
      expect(options).to.deep.equal(endpointOptions);
    });

    it('should call default create handler with fields', async () => {
      const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'create');
      const createHandler = CRUD.create?.(() => ({ repository, isAllowMultiple: true }));

      await createHandler(reqParams, endpointOptions);

      defaultHandlerStub.restore();

      const { fields, repository: repo, isAllowMultiple } = defaultHandlerStub.firstCall.firstArg;

      expect(fields).to.deep.equal(entityFields);
      expect(repository).to.equal(repo);
      expect(isAllowMultiple).to.ok;
    });

    it('handler - should throw error if we can try create multiple entities: isAllowMultiple disable', async () => {
      const result = CRUD.defaultHandler.create({
        fields: [{}, {}],
        repository,
        isAllowMultiple: false,
      });

      expect(await waitResult(result)).to.throw('Error: you can create');
    });

    it('handler - should throw error if entity not valid: validation failed', async () => {
      try {
        await CRUD.defaultHandler.create({
          fields: {},
          repository,
        });

        expect(1).to.be.equal(shouldNotCall);
      } catch (e) {
        expect(e.payload.length).to.equal(1);
        expect(e.payload[0].property).to.equal('param');
      }
    });

    it('handler - should success create entity', async () => {
      const fields = { param: 'test' };

      await CRUD.defaultHandler.create({
        fields,
        repository,
      });

      const [, passedFields, passedOptions] = TypeormMock.entityManager.save.firstCall.args;

      expect(passedFields).to.deep.equal([fields]);
      expect(passedOptions).to.have.property('chunk');
    });

    it('handler - should success create multiple entities', async () => {
      const fields = [{ param: 'test' }, { param: 'test2' }];

      await CRUD.defaultHandler.create({
        fields,
        repository,
        isAllowMultiple: true,
      });

      const [, passedFields, passedOptions] = TypeormMock.entityManager.save.firstCall.args;

      expect(passedFields).to.deep.equal(fields);
      expect(passedOptions).to.have.property('chunk');
    });

    it('handler - should validation failed for multiple entities', async () => {
      try {
        await CRUD.defaultHandler.create({
          fields: [{}, {}],
          repository,
          isAllowMultiple: true,
        });

        expect(1).to.be.equal(shouldNotCall);
      } catch (e) {
        expect(e.payload.length).to.equal(2);
        expect(e.payload[0][0].property).to.equal('param');
      }
    });

    it('handler - should throw error: duplicate entity', async () => {
      TypeormMock.entityManager.save.rejects(new Error('duplicate key'));

      const result = CRUD.defaultHandler.create({
        fields: { param: 'duplicate' },
        repository,
      });

      expect(await waitResult(result)).to.throw('already exists');
    });

    it('handler - should throw error: unknown error', async () => {
      TypeormMock.entityManager.save.rejects(new Error('Unknown'));

      const result = CRUD.defaultHandler.create({
        fields: { param: 'unknown' },
        repository,
      });

      expect(await waitResult(result)).to.throw('Unknown');
    });
  });

  describe('view', () => {
    const viewHandler = CRUD.view?.(() => ({ repository }), handler);
    const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'view').resolves(entity);

    beforeEach(() => {
      defaultHandlerStub.resetHistory();
    });

    it('should run default view handler with query builder: typeorm case', async () => {
      const viewWithDefaultHandler = CRUD.view?.(() => ({ repository }));

      const result = await viewWithDefaultHandler({ query: {} }, endpointOptions);
      const [queryBuilder] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(result).to.deep.equal(entity);
    });

    it('should run default view handler with query builder: query builder case', async () => {
      handler.resetHistory();
      // return query builder from handler
      handler.callsFake((query) => query.toQuery());

      const result = await viewHandler({}, endpointOptions);
      const [queryBuilder] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(result).to.deep.equal(entity);
    });

    it('should return custom result: entity', async () => {
      // return query builder from handler
      handler.callsFake(() => ({ ...entity, payloadParam: 1 }));

      const result = await viewHandler({}, endpointOptions);

      expect(result).to.deep.equal({ ...entity, payloadParam: 1 });
    });

    it('handler - should throw error: empty view condition', async () => {
      defaultHandlerStub.restore();

      const result = CRUD.defaultHandler.view(repository.createQueryBuilder());

      expect(await waitResult(result)).to.throw(emptyConditionMessage);
    });

    it('handler - should throw error: condition for multiple entities', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity, entity]);

      const result = CRUD.defaultHandler.view(repository.createQueryBuilder().where('id = 1'));

      expect(await waitResult(result)).to.throw('condition invalid');
    });

    it('handler - view should throw error: entity not found', async () => {
      TypeormMock.queryBuilder.getMany.resolves([]);

      const result = CRUD.defaultHandler.view(repository.createQueryBuilder().where('id = 1'));

      expect(await waitResult(result)).to.throw(entityNotFoundMessage);
    });

    it('handler - should success return entity', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity]);

      const result = await CRUD.defaultHandler.view(
        repository.createQueryBuilder().where('id = 1'),
      );

      expect(result).to.deep.equal(entity);
    });
  });

  describe('update', () => {
    const updateHandler = CRUD.update?.(() => ({ repository }), handler);
    const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'update').resolves(entity);

    beforeEach(() => {
      defaultHandlerStub.resetHistory();
    });

    it('should run default update handler with query builder: typeorm case', async () => {
      const updateWithDefaultHandler = CRUD.update?.(() => ({ repository }));

      const result = await updateWithDefaultHandler({ fields: entity }, endpointOptions);
      const [queryBuilder, passedFields, passedRepo] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedFields).to.deep.equal({ param: entity.param });
      expect(passedRepo).to.equal(repository);
      expect(result).to.deep.equal(entity);
    });

    it('should run default update handler with query builder: query builder case', async () => {
      // return query builder from handler
      handler.callsFake((query) => query.toQuery());

      const result = await updateHandler({}, endpointOptions);
      const [queryBuilder] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(result).to.deep.equal(entity);
    });

    it('should run default update handler with query builder: params typeorm case', async () => {
      // return typeorm from handler
      handler.callsFake((query) => ({ query }));

      const result = await updateHandler({ fields: entity }, endpointOptions);
      const [queryBuilder, passedFields] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedFields).to.deep.equal({ param: entity.param });
      expect(result).to.deep.equal(entity);
    });

    it('should run default update handler with query builder: params query builder case', async () => {
      const customFields = { param: entity.param, custom: 1 };

      // return query builder from handler
      handler.callsFake((query) => ({ query: query.toQuery(), fields: customFields }));

      const result = await updateHandler({ fields: entity }, endpointOptions);
      const [queryBuilder, passedFields] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedFields).to.deep.equal(customFields);
      expect(result).to.deep.equal(entity);
    });

    it('should throw error if handler return empty', async () => {
      // return empty from handler
      handler.callsFake(() => null);

      const result = updateHandler({}, endpointOptions);

      expect(await waitResult(result)).to.throw('Failed to update entity');
    });

    it('should return custom update result', async () => {
      // return empty from handler
      handler.callsFake(() => ({ result: entity }));

      const result = await updateHandler({}, endpointOptions);

      expect(result).to.deep.equal(entity);
    });

    it('handler - should throw error: empty fields', async () => {
      defaultHandlerStub.restore();

      const result = CRUD.defaultHandler.update(repository.createQueryBuilder(), {}, repository);

      expect(await waitResult(result)).to.throw('empty fields');
    });

    it('handler - should throw error: empty update condition', async () => {
      const result = CRUD.defaultHandler.update(
        repository.createQueryBuilder(),
        entity,
        repository,
      );

      expect(await waitResult(result)).to.throw(emptyConditionMessage);
    });

    it('handler - should throw error: condition for multiple entities', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity, entity]);

      const result = CRUD.defaultHandler.update(
        repository.createQueryBuilder().where('id = 1'),
        entity,
        repository,
      );

      expect(await waitResult(result)).to.throw('condition invalid');
    });

    it('handler - update should throw error: entity not found', async () => {
      TypeormMock.queryBuilder.getMany.resolves([]);

      const result = CRUD.defaultHandler.update(
        repository.createQueryBuilder().where('id = 1'),
        entity,
        repository,
      );

      expect(await waitResult(result)).to.throw(entityNotFoundMessage);
    });

    it('handler - should throw error: validation failed', async () => {
      TypeormMock.queryBuilder.getMany.resolves([repository.create(entity)]);

      try {
        await CRUD.defaultHandler.update(
          repository.createQueryBuilder().where('id = 1'),
          // @ts-ignore
          { asd: 1 },
          repository,
        );

        expect(1).to.be.equal(shouldNotCall);
      } catch (e) {
        expect(e.payload.length).to.equal(1);
        expect(e.payload[0].property).to.equal('asd');
      }
    });

    it('handler - should throw error: unknown error', async () => {
      TypeormMock.entityManager.save.rejects(new Error('Unknown'));
      TypeormMock.queryBuilder.getMany.resolves([repository.create(entity)]);

      const result = CRUD.defaultHandler.update(
        repository.createQueryBuilder().where('id = 1'),
        { param: 'unknown' },
        repository,
      );

      expect(await waitResult(result)).to.throw('Unknown');
    });

    it('handler - should success update entity', async () => {
      TypeormMock.queryBuilder.getMany.resolves([repository.create(entity)]);

      await CRUD.defaultHandler.update(
        repository.createQueryBuilder().where('id = 1'),
        { param: 'success' },
        repository,
      );

      const [, updatedEntity] = TypeormMock.entityManager.save.firstCall.args;

      expect(updatedEntity).to.deep.equal({ ...entity, param: 'success' });
    });
  });

  describe('remove', () => {
    const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'remove').resolves(removeResult());
    const defaultOptions = {
      isAllowMultiple: false,
      isSoftDelete: false,
    };

    it('should run default remove handler with query builder: typeorm case', async () => {
      const removeHandler = CRUD.remove?.(() => ({ repository }));

      const result = await removeHandler({}, endpointOptions);
      const [passedRepo, queryBuilder, passedOptions] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedRepo).to.equal(repository);
      expect(passedOptions.isSoftDelete).to.false;
      expect(passedOptions.isAllowMultiple).to.ok;
      expect(result).to.deep.equal(removeResult());
    });

    it('should run default remove handler with query builder: typeorm case', async () => {
      // return query builder from handler
      handler.callsFake((query) => query.toQuery());
      defaultHandlerStub.resetHistory();

      const removeHandler = CRUD.remove?.(
        () => ({ repository, isSoftDelete: true, isAllowMultiple: false }),
        handler,
      );

      const result = await removeHandler({}, endpointOptions);
      const [passedRepo, queryBuilder, passedOptions] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedRepo).to.equal(repository);
      expect(passedOptions.isSoftDelete).to.ok;
      expect(passedOptions.isAllowMultiple).to.false;
      expect(result).to.deep.equal(removeResult());
    });

    it('should return custom result: remove', async () => {
      // return custom result
      handler.callsFake(() => [entity]);

      const removeHandler = CRUD.remove?.(() => ({ repository }), handler);
      const result = await removeHandler({}, endpointOptions);

      expect(result).to.deep.equal([entity]);
    });

    it('handler - should throw error: empty remove condition', async () => {
      defaultHandlerStub.restore();

      const result = CRUD.defaultHandler.remove(
        repository,
        repository.createQueryBuilder(),
        defaultOptions,
      );

      expect(await waitResult(result)).to.throw(emptyConditionMessage);
    });

    it('handler - remove should throw error: entity not found', async () => {
      const result = CRUD.defaultHandler.remove(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        defaultOptions,
      );

      expect(await waitResult(result)).to.throw(entityNotFoundMessage);
    });

    it('handler - should throw error: try remove multiple entities (isAllowMultiple - false)', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity, entity]);

      const result = CRUD.defaultHandler.remove(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        defaultOptions,
      );

      expect(await waitResult(result)).to.throw('only one entity at a time');
    });

    it('handler - should throw unknown error', async () => {
      TypeormMock.entityManager.remove.rejects(new Error('Unknown'));
      TypeormMock.queryBuilder.getMany.resolves([entity]);

      const result = CRUD.defaultHandler.remove(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        defaultOptions,
      );

      expect(await waitResult(result)).to.throw('Unknown');
    });

    it('handler - should success remove entity', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity]);

      const result = await CRUD.defaultHandler.remove(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        defaultOptions,
      );

      expect(TypeormMock.entityManager.remove).to.be.calledOnce;
      expect(result).to.deep.equal(removeResult([{ id: entity.id }]));
    });

    it('handler - should success soft remove entity', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity]);

      const result = await CRUD.defaultHandler.remove(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        { isAllowMultiple: false, isSoftDelete: true },
      );

      expect(TypeormMock.entityManager.softRemove).to.be.calledOnce;
      expect(result).to.deep.equal(removeResult([{ id: entity.id }]));
    });
  });

  describe('restore', () => {
    const defaultHandlerStub = sandbox
      .stub(CRUD.defaultHandler, 'restore')
      .resolves(restoreResult());

    it('should run default restore handler with query builder: typeorm case', async () => {
      const restoreHandler = CRUD.restore?.(() => ({ repository }));

      const result = await restoreHandler({}, endpointOptions);
      const [passedRepo, queryBuilder, isAllowMultiple] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedRepo).to.equal(repository);
      expect(isAllowMultiple).to.ok;
      expect(result).to.deep.equal(restoreResult());
    });

    it('should run default restore handler with query builder: typeorm case', async () => {
      // return query builder from handler
      handler.callsFake((query) => query.toQuery());
      defaultHandlerStub.resetHistory();

      const restoreHandler = CRUD.restore?.(
        () => ({ repository, isAllowMultiple: false }),
        handler,
      );

      const result = await restoreHandler({}, endpointOptions);
      const [passedRepo, queryBuilder, isAllowMultiple] = defaultHandlerStub.firstCall.args;

      expect(queryBuilder).to.be.instanceof(SelectQueryBuilder);
      expect(passedRepo).to.equal(repository);
      expect(isAllowMultiple).to.false;
      expect(result).to.deep.equal(restoreResult());
    });

    it('should return custom result: restore', async () => {
      // return custom result
      handler.callsFake(() => restoreResult([entity]));

      const restoreHandler = CRUD.restore?.(() => ({ repository }), handler);
      const result = await restoreHandler({}, endpointOptions);

      expect(result).to.deep.equal(restoreResult([entity]));
    });

    it('handler - should throw error: empty restore condition', async () => {
      defaultHandlerStub.restore();

      const result = CRUD.defaultHandler.restore(
        repository,
        repository.createQueryBuilder(),
        false,
      );

      expect(await waitResult(result)).to.throw(emptyConditionMessage);
    });

    it('handler - restore should throw error: entity not found', async () => {
      const result = CRUD.defaultHandler.restore(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        false,
      );

      expect(await waitResult(result)).to.throw(entityNotFoundMessage);
    });

    it('handler - should throw error: try restore multiple entities (isAllowMultiple - false)', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity, entity]);

      const result = CRUD.defaultHandler.restore(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        false,
      );

      expect(await waitResult(result)).to.throw('only one entity at a time');
    });

    it('handler - should throw unknown error', async () => {
      TypeormMock.entityManager.recover.rejects(new Error('Unknown'));
      TypeormMock.queryBuilder.getMany.resolves([entity]);

      const result = CRUD.defaultHandler.restore(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        false,
      );

      expect(await waitResult(result)).to.throw('Unknown');
    });

    it('handler - should success restore entity', async () => {
      TypeormMock.queryBuilder.getMany.resolves([entity]);

      const result = await CRUD.defaultHandler.restore(
        repository,
        repository.createQueryBuilder().where('id = 1'),
        false,
      );

      expect(TypeormMock.entityManager.recover).to.be.calledOnce;
      expect(result).to.deep.equal(restoreResult());
    });
  });

  describe('controller', () => {
    it('should return default controller methods', () => {
      const result = CRUD.controller(() => repository);
      const handlers = Object.entries(result);

      for (const [method, methodHandler] of handlers) {
        expect(typeof CRUD[method]).to.equal('function');
        expect(typeof methodHandler).to.equal('function');
      }

      expect(handlers).to.length(7);
    });

    it('should return default controller methods: disable restore method', () => {
      const result = CRUD.controller(() => repository, { restore: false });

      expect(result).to.not.have.property('restore');
    });

    it('should return custom restore controller method with custom options', async () => {
      const defaultHandlerStub = sandbox.stub(CRUD.defaultHandler, 'restore');
      const customMethodName = 'custom-restore';
      const methods = CRUD.controller(() => repository, {
        restore: {
          path: customMethodName,
          options: () => ({ isAllowMultiple: false }),
        },
      });

      await methods[customMethodName]({});
      defaultHandlerStub.restore();

      const [passedRepo, qb, isAllowMultiple] = defaultHandlerStub.firstCall.args;

      expect(methods).to.not.have.property('restore');
      expect(methods).to.have.property(customMethodName);
      expect(passedRepo).to.equal(repository);
      expect(qb).to.instanceof(SelectQueryBuilder);
      expect(isAllowMultiple).to.false;
    });
  });
});

import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  adminsRelationMock,
  adminsSingleTypeMock,
  adminsMock,
  errMsgFailedToGetComponentData,
} from '@__mocks__/single-type-view-process';
import IExpandData from '@interfaces/expand-data';
import ComponentRepository from '@repositories/component';
import SingleTypeRepository from '@repositories/single-type';
import SingleTypeViewProcess from '@services/single-type-view-process';

describe('services/single-type-view-process', () => {
  const sandbox = sinon.createSandbox();
  const componentRepository = TypeormMock.entityManager.getCustomRepository(ComponentRepository);
  const singleTypeRepository = TypeormMock.entityManager.getCustomRepository(SingleTypeRepository);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: incorrect relation routes', async () => {
    const relations = ['relation/admins'];
    const service = SingleTypeViewProcess.init({
      // @ts-ignore
      entity: {},
      componentRepository,
      singleTypeRepository,
    });

    expect(await waitResult(service.expand(relations))).to.throw(
      BaseException,
      'Failed to get relation data. Incorrectly built relation routes',
    );
  });

  it("should throw error: component data don't exists", async () => {
    const service = SingleTypeViewProcess.init({
      // @ts-ignore
      entity: {},
      componentRepository,
      singleTypeRepository,
    });

    expect(await waitResult(service.expand(adminsRelationMock))).to.throw(
      BaseException,
      errMsgFailedToGetComponentData,
    );
  });

  it("should throw error: data don't exists wrong single types value", async () => {
    const entity = singleTypeRepository.create({
      alias: 'blog',
      value: {},
    });

    const service = SingleTypeViewProcess.init({
      entity,
      componentRepository,
      singleTypeRepository,
    });

    expect(await waitResult(service.expand(adminsRelationMock))).to.throw(
      BaseException,
      errMsgFailedToGetComponentData,
    );
  });

  it('should throw error: links lead to non-existent components', async () => {
    const entity = singleTypeRepository.create(adminsSingleTypeMock);
    const service = SingleTypeViewProcess.init({
      entity,
      componentRepository,
      singleTypeRepository,
    });

    expect(await waitResult(service.expand(adminsRelationMock))).to.throw(
      BaseException,
      'Failed to get one or more expanded routes according to the passed relationship routes',
    );
  });

  it('should correctly expand admins data', async () => {
    const entity = singleTypeRepository.create(adminsSingleTypeMock);
    const service = SingleTypeViewProcess.init({
      entity,
      componentRepository,
      singleTypeRepository,
    });

    const [route] = adminsRelationMock;

    const handleRelationsStub = sinon.stub(componentRepository, 'handleRelations');

    handleRelationsStub.resolves({
      route,
      microservice: 'users',
      entity: 'user',
    });

    /**
     * Returns stubbed version of PRIVATE method
     * that's the reason of usage ts-ignore
     */
    // @ts-ignore
    const handleExpandStub = sinon.stub(service, 'handleExpand');

    // @ts-ignore
    handleExpandStub.resolves({ data: adminsMock, routeRef: route } as IExpandData);

    const adminsSingleType = { ...adminsSingleTypeMock };

    // @ts-ignore
    adminsSingleType.value.blog.data.admins = adminsMock;
    expect(await waitResult(service.expand(adminsRelationMock))).to.deep.equal(adminsSingleType);
  });
});

import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonSpy } from 'sinon';
import { Repository } from 'typeorm';
import { FilterType } from '@constants/filter';
import { MS_DEFAULT_ROLE_ALIAS } from '@constants/index';
import Method from '@entities/method';
import MethodFilter from '@entities/method-filter';
import Model from '@entities/model';
import OriginalEndpointHandler from '@services/endpoint-handler';
import Enforcer, { IEnforcerParams } from '@services/enforcer';
import FieldsFilter, { IFieldsFilter } from '@services/fields-filter';
import MethodFilters, { IMethodFiltersParams } from '@services/method-filters';

const { default: EndpointHandler } = rewiremock.proxy<{
  default: typeof OriginalEndpointHandler;
}>(() => require('@services/endpoint-handler'), {
  typeorm: TypeormMock.mock,
});

describe('services/endpoint-handler', () => {
  const sandbox = sinon.createSandbox();
  const microservice = 'demo';
  const methodPath = 'run.something';
  const methodName = [microservice, methodPath].join('.');
  const userId = 'user-id-1';
  const service = EndpointHandler.init(methodName, {
    userId,
    hasFilters: true,
    hasFilterInput: true,
    hasFilterOutput: true,
  });

  const methodRepository = TypeormMock.entityManager.getRepository(Method);

  const methodFilters = [
    TypeormMock.entityManager.getRepository(MethodFilter).create({ methodId: 1, filterId: 2 }),
  ];
  const modelIn = TypeormMock.entityManager
    .getRepository(Model)
    .create({ alias: 'testInModel', schema: {} });
  const modelOut = TypeormMock.entityManager
    .getRepository(Model)
    .create({ alias: 'testModel', schema: {} });
  const method = methodRepository.create({
    microservice,
    method: methodPath,
    methodFilters,
    modelIn,
    modelOut,
  });

  let enforcer: Enforcer | undefined;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly get method with relations & init enforcer once & cache method', async () => {
    TypeormMock.entityManager.findOne.resolves(method);

    let enforceSpy: SinonSpy | undefined;
    let enforcerInitParams: IEnforcerParams | undefined;
    const enforcerInitStub = sandbox.stub(Enforcer, 'init').callsFake((params) => {
      enforcerInitStub.restore();

      enforcer = Enforcer.init(params);

      enforcerInitParams = params;
      enforceSpy = sandbox.spy(enforcer, 'enforce');

      return enforcer;
    });

    // call twice for check cache method & enforcer
    await service.isMethodAllowed(false);
    await service.isMethodAllowed(false);

    const [, condition, { relations }] = TypeormMock.entityManager.findOne.firstCall.args;

    // enforcer
    expect(enforcerInitParams?.userId).to.equal(userId);
    expect(enforcerInitParams?.defaultRole).to.equal(MS_DEFAULT_ROLE_ALIAS);
    expect(enforcerInitParams?.userRoleRepository).to.instanceof(Repository);
    expect(enforcerInitParams?.rolesTreeRepository).to.instanceof(Repository);
    expect(enforceSpy?.firstCall.firstArg).to.equal(method);
    expect(enforceSpy?.firstCall.lastArg).to.equal(false);
    // cache enforcer
    expect(service).to.have.property('enforcer').to.not.undefined;

    // method
    expect(condition).to.deep.equal({ microservice, method: methodPath });
    expect(relations).to.deep.equal([
      'methodFilters',
      'methodFilters.filter',
      'modelIn',
      'modelOut',
    ]);
    // cache method
    expect(service).to.have.property('method').to.equal(method);
  });

  it('should correctly get method filters', async () => {
    const roles = ['test'];

    sandbox.stub(enforcer as Enforcer, 'findUserRoles').resolves({ userId, roles });

    let methodFiltersSpy: SinonSpy | undefined;
    let methodFiltersParams: IMethodFiltersParams | undefined;
    const methodFiltersInitStub = sandbox.stub(MethodFilters, 'init').callsFake((params) => {
      methodFiltersInitStub.restore();

      const methodFiltersService = MethodFilters.init(params);

      methodFiltersParams = params;
      methodFiltersSpy = sandbox.spy(methodFiltersService, 'getFilters');

      return methodFiltersService;
    });
    const reqParams = { hello: 'world' };

    await service.getMethodFilters(reqParams);

    const { userRoles, templateOptions } = methodFiltersParams ?? {};

    expect(userRoles).to.deep.equal(roles);
    expect(templateOptions).to.deep.equal({ userId, fields: reqParams });
    expect(methodFiltersSpy?.firstCall.firstArg).to.deep.equal(methodFilters);
  });

  it('should correctly filter fields', async () => {
    const roles = ['test2'];

    sandbox.stub(enforcer as Enforcer, 'findUserRoles').resolves({ userId, roles });

    const fields = { hello: 'world' };
    const cases = [
      { type: FilterType.IN, model: modelIn },
      { type: FilterType.OUT, model: modelOut },
    ];

    for (const { type, model } of cases) {
      let fieldsFilterSpy: SinonSpy | undefined;
      let fieldsFilterParams: IFieldsFilter | undefined;
      const fieldsFilterInitStub = sandbox.stub(FieldsFilter, 'init').callsFake((params) => {
        fieldsFilterInitStub.restore();

        const fieldsFilterService = FieldsFilter.init(params);

        fieldsFilterParams = params;
        fieldsFilterSpy = sandbox.spy(fieldsFilterService, 'filter');

        return fieldsFilterService;
      });

      await service.filterFields(type, fields);

      const { userId: filterUserId, userRoles, modelRepository } = fieldsFilterParams ?? {};

      const [resType, resModel, resFields] = fieldsFilterSpy?.firstCall.args ?? [];

      expect(filterUserId).to.equal(userId);
      expect(userRoles).to.deep.equal(roles);
      expect(modelRepository).to.instanceOf(Repository);
      expect(resType).to.equal(type);
      expect(resModel).to.deep.equal(model);
      expect(resFields).to.deep.equal(fields);
    }
  });

  it('should get method without relations', async () => {
    const localService = EndpointHandler.init(methodName, {
      userId,
      hasFilters: false,
      hasFilterInput: false,
      hasFilterOutput: false,
    });

    await localService.isMethodAllowed(false);

    const [, , { relations }] = TypeormMock.entityManager.findOne.firstCall.args;

    expect(relations).to.deep.equal([]);
  });
});

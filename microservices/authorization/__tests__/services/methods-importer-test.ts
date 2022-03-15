import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { BaseException, Microservice, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import FieldPolicy from '@constants/field-policy';
import Method from '@entities/method';
import Model from '@entities/model';
import OriginalEndpointHandler from '@services/methods-importer';

const { default: MethodsImporter } = rewiremock.proxy<{
  default: typeof OriginalEndpointHandler;
}>(() => require('@services/methods-importer'), {
  typeorm: TypeormMock.mock,
});

describe('services/methods-importer', () => {
  const sandbox = sinon.createSandbox();
  const ms = Microservice.create();
  const params = {
    defaultAllowGroup: ['admin'],
    defaultSchemaRoles: ['admin'],
    commonModelAliases: ['TestCommonInput'],
  };
  const service = MethodsImporter.create(ms, TypeormMock.entityManager, params);
  const methodRepository = TypeormMock.entityManager.getRepository(Method);
  const modelRepository = TypeormMock.entityManager.getRepository(Model);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should skip import microservice metadata: microservice not respond', async () => {
    sandbox.stub(ms, 'lookup').resolves(['demo1']);
    sandbox
      .stub(ms, 'sendRequest')
      .resolves(new MicroserviceResponse({ error: new BaseException() }));

    await service.import();

    // 'getRepository' inside transaction
    expect(TypeormMock.entityManager.getRepository).to.not.called;
  });

  it("should skip import microservice metadata: microservice meta endpoint doesn't exist.", async () => {
    sandbox.stub(ms, 'lookup').resolves(['demo1']);
    sandbox.stub(ms, 'sendRequest').rejects(new BaseException());

    await service.import();

    // 'getRepository' inside transaction
    expect(TypeormMock.entityManager.getRepository).to.not.called;
  });

  it('should skip import microservice metadata: microservice endpoints empty', async () => {
    sandbox.stub(ms, 'lookup').resolves(['demo1']);
    sandbox.stub(ms, 'sendRequest').resolves(new MicroserviceResponse({ result: {} }));

    const result = await service.import();

    // 'getRepository' inside transaction
    expect(TypeormMock.entityManager.getRepository).to.not.called;
    expect(result).to.deep.equal({ demo1: { error: 'Microservice endpoints not found: demo1' } });
  });

  it('should correctly import microservices methods without models: one update, one create', async () => {
    const endpointsDemo = {
      'test.method': { input: [], output: [], description: 'Should be updated' },
    };
    const endpointsDemo2 = {
      'sample.endpoint': { input: [], output: [], description: 'Test 1' },
    };
    const testMethod = methodRepository.create({
      microservice: 'demo1',
      method: 'test.method',
      description: 'Init description',
      allowGroup: ['user'],
    });

    sandbox.stub(ms, 'lookup').resolves(['demo1', 'demo2']);
    sandbox
      .stub(ms, 'sendRequest')
      .onFirstCall()
      .resolves(new MicroserviceResponse({ result: { endpoints: endpointsDemo } }))
      .onSecondCall()
      .resolves(new MicroserviceResponse({ result: { endpoints: endpointsDemo2 } }));

    TypeormMock.entityManager.findOne
      .onFirstCall()
      .resolves(testMethod)
      .onSecondCall()
      .resolves(undefined);

    const result = await service.import();

    const [, demoMethod] = TypeormMock.entityManager.save.firstCall.args;
    const [, demo2Method] = TypeormMock.entityManager.save.secondCall.args;

    expect(result).to.deep.equal({ demo1: { isSuccess: true }, demo2: { isSuccess: true } });
    expect(TypeormMock.entityManager.save).to.calledTwice; // save two method
    expect(demoMethod).to.deep.equal({
      microservice: 'demo1',
      method: 'test.method',
      description: 'Should be updated',
      allowGroup: ['user', 'admin'],
      modelInId: null,
      modelOutId: null,
    });
    expect(demo2Method).to.deep.equal({
      microservice: 'demo2',
      method: 'sample.endpoint',
      description: 'Test 1',
      allowGroup: ['admin'],
    });
  });

  it('should correctly import models: common models, exist model', async () => {
    const entities = {
      [params.commonModelAliases[0]]: {
        properties: {
          testField: { type: 'number' },
        },
      },
      TestExistModel: {
        properties: {
          newField: { type: 'string' },
          keepIt: { type: 'boolean' },
        },
      },
    };
    const endpointsDemo = {
      'test.common': {
        input: [params.commonModelAliases[0]],
        output: [],
        description: 'Test 1',
      },
    };
    const endpointsDemo2 = {
      'test.with-exist': {
        input: ['TestExistModel'],
        output: ['TestOutputModel'],
        description: 'Test 2',
      },
    };
    const existModel = modelRepository.create({
      id: 1,
      microservice: 'demo2',
      title: 'Test Exist Model',
      alias: 'demo2.TestExistModel',
      schema: {
        sampleField: { in: {}, out: {} },
        keepIt: { in: { user: FieldPolicy.deny }, out: {} },
      },
    });

    sandbox.stub(ms, 'lookup').resolves(['demo1', 'demo2']);
    sandbox
      .stub(ms, 'sendRequest')
      .onFirstCall()
      .resolves(new MicroserviceResponse({ result: { endpoints: endpointsDemo, entities } }))
      .onSecondCall()
      .resolves(new MicroserviceResponse({ result: { endpoints: endpointsDemo2, entities } }));

    TypeormMock.entityManager.findOne.callsFake((_, condition) => {
      if (condition.alias?.includes?.('TestExistModel')) {
        return existModel;
      }

      return undefined;
    });
    TypeormMock.entityManager.save.callsFake((_, entity) => {
      if (entity.alias?.includes?.('TestExistModel')) {
        return entity;
      }

      return { id: 2, ...entity };
    });

    await service.import();

    // save common model
    const [, commonModel] = TypeormMock.entityManager.save.firstCall.args;
    // save method with model (demo microservice)
    const [, testCommonMethod] = TypeormMock.entityManager.save.secondCall.args;
    // save exist model
    const [, existModelRes] = TypeormMock.entityManager.save.thirdCall.args;
    // save output model
    const [, outputModel] = TypeormMock.entityManager.save.getCall(3).args;
    // save method
    const [, testExistMethod] = TypeormMock.entityManager.save.getCall(4).args;

    // demo microservice
    expect(commonModel).to.deep.equal({
      alias: 'TestCommonInput',
      title: 'Test Common Input',
      schema: { testField: { in: { admin: 'allow' }, out: { admin: 'allow' } } },
    });
    expect(testCommonMethod.modelInId).to.equal(2);

    // demo2 microservice
    expect(existModelRes).to.deep.equal({
      id: 1,
      microservice: 'demo2',
      alias: 'demo2.TestExistModel',
      title: 'Test Exist Model',
      schema: {
        keepIt: { in: { user: 'deny' }, out: {} },
        newField: { in: { admin: 'allow' }, out: { admin: 'allow' } },
      },
    });
    expect(outputModel).to.deep.equal({
      microservice: 'demo2',
      alias: 'demo2.TestOutputModel',
      title: 'Test Output Model',
      schema: {},
    });
    expect(testExistMethod.modelInId).to.equal(1);
    expect(testExistMethod.modelOutId).to.equal(2);
  });

  it('should correctly import models: related schemas, nested schema objects', async () => {
    const metadata = {
      endpoints: {
        // case with related schema in input and output
        'test.endpoint': {
          input: ['TestInput', { fields: 'AnotherSchema' }],
          output: ['TestOutput', { list: ['AnotherSchema'] }],
        },
        // case with nested object schema
        'test.nested': {
          input: ['NestedInput'],
          output: [],
        },
      },
      entities: {
        AnotherSchema: { properties: { id: { type: 'number' } } },
        TestInput: { properties: { fields: { type: 'object' } } },
        TestOutput: { properties: { list: { type: 'object' } } },
        NestedInput: {
          properties: {
            field1: { type: 'number' },
            field2: {
              properties: {
                nestedField: { type: 'string' },
                nestedField2: { type: 'boolean' },
                nestedFieldRef: { $ref: '#/example/AnotherSchema' },
              },
            },
          },
        },
      },
    };

    sandbox.stub(ms, 'lookup').resolves(['demo1']);
    sandbox.stub(ms, 'sendRequest').resolves(new MicroserviceResponse({ result: metadata }));
    TypeormMock.entityManager.findOne.resolves(undefined);

    await service.import();

    const [, anotherSchemaModel] = TypeormMock.entityManager.save.firstCall.args;
    const [, testInputModel] = TypeormMock.entityManager.save.secondCall.args;
    const [, testOutputModel] = TypeormMock.entityManager.save.thirdCall.args;
    const [, nestedInputModel] = TypeormMock.entityManager.save.getCall(4).args;

    const anotherSchemaAlias = 'demo1.AnotherSchema';

    // test.endpoint
    expect(anotherSchemaModel).to.deep.equal({
      microservice: 'demo1',
      alias: anotherSchemaAlias,
      title: 'Another Schema',
      schema: { id: { in: { admin: 'allow' }, out: { admin: 'allow' } } },
    });
    expect(testInputModel).to.deep.equal({
      microservice: 'demo1',
      alias: 'demo1.TestInput',
      title: 'Test Input',
      schema: { fields: anotherSchemaAlias },
    });
    expect(testOutputModel).to.deep.equal({
      microservice: 'demo1',
      alias: 'demo1.TestOutput',
      title: 'Test Output',
      schema: { list: anotherSchemaAlias },
    });

    // test.nested
    expect(nestedInputModel).to.deep.equal({
      microservice: 'demo1',
      alias: 'demo1.NestedInput',
      title: 'Nested Input',
      schema: {
        field1: { in: { admin: 'allow' }, out: { admin: 'allow' } },
        field2: {
          object: {
            nestedField: {
              in: {
                admin: 'allow',
              },
              out: {
                admin: 'allow',
              },
            },
            nestedField2: {
              in: {
                admin: 'allow',
              },
              out: {
                admin: 'allow',
              },
            },
            nestedFieldRef: 'demo1.AnotherSchema',
          },
        },
      },
    });
  });
});

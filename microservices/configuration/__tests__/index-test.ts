import { Log } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareServer } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import ConfigRepositoryMock from '@__mocks__/config-repository';
import * as DBConfig from '@config/db';
import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_NAME, MS_CONNECTION } from '@constants/index';
import { start as OriginalStart } from '../src';

const { start } = rewiremock.proxy<{ start: typeof OriginalStart }>(() => require('../src'), {
  '@config/db': { createDbConnection: TypeormMock.stubs.createConnection },
});

describe('microservice: module', () => {
  const configRepository = new ConfigRepositoryMock();
  const sandbox = sinon.createSandbox();

  before(() => {
    TypeormMock.sandbox.reset();
    TypeormMock.entityManager.getCustomRepository.returns(configRepository);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly start microservice', async () => {
    const spyCreate = sandbox.spy(Microservice, 'create');
    const registerMethodsStub = sandbox.stub();
    let stubbedStart;
    let addRegisterEndpointSpy;
    let addObtainEndpointSpy;
    let dbConnection;
    let isRunBeforeStart = false;

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      hooks: {
        afterDbConnection: (microservice, connection) => {
          stubbedStart = sandbox.stub(microservice, 'start').resolves();
          dbConnection = connection;
        },
        afterInitRemoteMiddleware: (remoteMiddleware) => {
          addRegisterEndpointSpy = sandbox.spy(remoteMiddleware, 'addRegisterEndpoint');
          addObtainEndpointSpy = sandbox.spy(remoteMiddleware, 'addObtainEndpoint');
        },
        beforeStart: () => {
          isRunBeforeStart = true;
        },
      },
      registerMethods: registerMethodsStub,
    });

    const createOptions = spyCreate.firstCall.firstArg;

    expect(createOptions).to.includes({ name: MS_NAME, connection: MS_CONNECTION });
    expect(stubbedStart).to.calledOnce;
    expect(isRunBeforeStart).to.ok;
    expect(dbConnection).to.deep.equal(TypeormMock.entityManager.connection);
    expect(addRegisterEndpointSpy).to.calledOnce;
    expect(addObtainEndpointSpy).to.calledOnce;
    expect(configRepository.bulkSave).to.calledTwice; // config & middleware
    expect(registerMethodsStub).to.calledOnceWith(Microservice.getInstance());
  });

  it('should correctly start microservice without remote middleware', async () => {
    sandbox.stub(Microservice.getInstance(), 'start').resolves();
    sandbox.stub(RemoteMiddlewareServer, 'instance' as any).value(undefined);

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      isDisableRemoteMiddleware: true,
    });

    expect(RemoteMiddlewareServer.getInstance()).to.undefined;
  });

  it('should log error if microservice start failed', async () => {
    const startStub = sandbox.stub(Microservice.getInstance(), 'start').rejects();
    const logSpy = sandbox.spy(Log, 'error');

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
    });

    logSpy.restore();
    startStub.restore();

    expect(logSpy).to.calledOnce;
  });

  it('should have microservice custom logger', () => {
    const { logDriver } = microserviceParams;
    const LogInfoSpy = sandbox.spy(Log, 'info');

    if (typeof logDriver !== 'boolean') {
      logDriver?.(() => 'test');
    }

    expect(LogInfoSpy).to.calledOnce;
  });
});

import { Log, RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import * as DBConfig from '@config/db';
import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_NAME, MS_CONNECTION } from '@constants/index';
import { start as OriginalStart } from '../src';

const { start } = rewiremock.proxy<{ start: typeof OriginalStart }>(() => require('../src'), {
  '@config/db': { createDbConnection: TypeormMock.stubs.createConnection },
});

describe('users', () => {
  const sandbox = sinon.createSandbox();

  before(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly start microservice', async () => {
    const spyCreate = sandbox.spy(Microservice, 'create');
    const registerMethodsStub = sandbox.stub();
    let stubbedStart;
    let isRunBeforeStart = false;
    let addRegisterEndpointSpy;
    let obtainMiddlewares;
    let dbConnection;

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      hooks: {
        afterCreateMicroservice: (microservice, connection) => {
          stubbedStart = sandbox.stub(microservice, 'start').resolves();
          dbConnection = connection;
        },
        afterInitRemoteMiddleware: (remoteMiddleware) => {
          addRegisterEndpointSpy = sandbox.spy(remoteMiddleware, 'addRegisterEndpoint');
          obtainMiddlewares = sandbox.stub(remoteMiddleware, 'obtainMiddlewares').resolves();
        },
        beforeStart: () => {
          isRunBeforeStart = true;
        },
      },
      registerMethods: registerMethodsStub,
    });

    const createOptions = spyCreate.firstCall.firstArg;

    expect(createOptions).to.includes({ name: MS_NAME, connection: MS_CONNECTION });
    expect(dbConnection).to.equal(TypeormMock.entityManager.connection);
    expect(stubbedStart).to.calledOnce;
    expect(isRunBeforeStart).to.ok;
    expect(addRegisterEndpointSpy).to.calledOnce;
    expect(obtainMiddlewares).to.calledOnce;
    expect(registerMethodsStub).to.calledOnceWith(Microservice.getInstance());
  });

  it('should correctly start gateway without remote middleware', async () => {
    sandbox.stub(Microservice.getInstance(), 'start').resolves();
    sandbox.stub(RemoteMiddlewareClient, 'instance' as any).value(undefined);

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      isDisableRemoteMiddleware: true,
    });

    expect(RemoteMiddlewareClient.getInstance()).to.undefined;
  });

  it('should correctly start with remote db config', async () => {
    sandbox.stub(Microservice.getInstance(), 'start').resolves();
    sandbox.stub(RemoteConfig, 'get').resolves({ host: 'localhost-test' });

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      dbOptionsObtain: true,
      isDisableRemoteMiddleware: true,
    });

    const [connectionOpts] = TypeormMock.stubs.createConnection.lastCall.args;

    expect(connectionOpts.host).to.equal('localhost-test');
  });

  it('should log error if microservice start failed', async () => {
    const startStub = sandbox.stub(Microservice.getInstance(), 'start').rejects();
    const logSpy = sandbox.spy(Log, 'error');

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      hooks: {
        afterInitRemoteMiddleware: (remoteMiddleware) => {
          sandbox.stub(remoteMiddleware, 'obtainMiddlewares').resolves();
        },
      },
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

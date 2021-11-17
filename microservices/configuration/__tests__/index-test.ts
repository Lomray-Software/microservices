import TypeormMock from '@lomray/microservice-helpers/mocks/typeorm';
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

describe('start', () => {
  const configRepository = new ConfigRepositoryMock();

  before(() => {
    sinon.stub(console, 'info');
    TypeormMock.sandbox.reset();

    TypeormMock.entityManager.getCustomRepository.returns(configRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should correct start microservice', async () => {
    const spyCreate = sinon.spy(Microservice, 'create');
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
          stubbedStart = sinon.stub(microservice, 'start').resolves();
          dbConnection = connection;
        },
        afterInitRemoteMiddleware: (remoteMiddleware) => {
          addRegisterEndpointSpy = sinon.spy(remoteMiddleware, 'addRegisterEndpoint');
          addObtainEndpointSpy = sinon.spy(remoteMiddleware, 'addObtainEndpoint');
        },
        beforeStart: () => {
          isRunBeforeStart = true;
        },
      },
    });

    const createOptions = spyCreate.firstCall.firstArg;

    expect(createOptions).to.includes({ name: MS_NAME, connection: MS_CONNECTION });
    expect(stubbedStart).to.calledOnce;
    expect(isRunBeforeStart).to.ok;
    expect(dbConnection).to.deep.equal(TypeormMock.entityManager.connection);
    expect(addRegisterEndpointSpy).to.calledOnce;
    expect(addObtainEndpointSpy).to.calledOnce;
    expect(configRepository.bulkSave).to.calledOnce;
  });

  it('should correct start microservice without remote middleware', async () => {
    sinon.stub(Microservice.getInstance(), 'start').resolves();
    sinon.stub(RemoteMiddlewareServer, 'instance' as any).value(undefined);

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      dbOptions: DBConfig.connectionDbOptions,
      isDisableRemoteMiddleware: true,
    });

    expect(RemoteMiddlewareServer.getInstance()).to.undefined;
  });
});

import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareServer } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import sinon from 'sinon';
import type { Connection } from 'typeorm';
import * as DBConfig from '@config/db';
import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_NAME, MS_CONNECTION } from '@constants/index';
import { start } from '../src';

describe('start', () => {
  const middlewareRepo = { middleware: 'repo' };
  const dbConnectionMock = {
    getRepository: sinon.stub().returns(middlewareRepo),
  } as unknown as Promise<Connection>;

  before(() => {
    sinon.stub(console, 'info');
  });

  beforeEach(() => {
    sinon.stub(DBConfig, 'createDbConnection').resolves(dbConnectionMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should correct start microservice', async () => {
    const spyCreate = sinon.spy(Microservice, 'create');
    let stubbedStart;
    let remoteMiddlewareInstance;
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
          remoteMiddlewareInstance = remoteMiddleware;
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
    expect(dbConnection).to.deep.equal(dbConnectionMock);
    expect(remoteMiddlewareInstance).property('repository').to.deep.equal(middlewareRepo);
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

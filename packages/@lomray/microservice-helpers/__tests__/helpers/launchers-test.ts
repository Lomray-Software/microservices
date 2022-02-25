import { Gateway, Microservice } from '@lomray/microservice-nodejs-lib';
import {
  IMiddlewareRepository,
  RemoteMiddlewareClient,
  RemoteMiddlewareServer,
} from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import type { ConnectionOptions } from 'typeorm';
import { start as OriginalStart, startWithDb as OriginalStartWithDb } from '@helpers/launchers';
import { TypeormMock } from '@mocks/index';
import RemoteConfig from '@services/remote-config';
import waitResult from '@test-helpers/wait-result';

const CreateDbConnection = sinon.stub().resolves();
const { start, startWithDb } = rewiremock.proxy<{
  startWithDb: typeof OriginalStartWithDb;
  start: typeof OriginalStart;
}>(() => require('@helpers/launchers'), {
  '@helpers/create-db-connection': CreateDbConnection,
});

describe('authentication', () => {
  const sandbox = sinon.createSandbox();
  const msOptions = { name: 'ms-name' };
  const msParams = { logDriver: false };
  const dbOptions: ConnectionOptions = { type: 'postgres' };

  before(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly start microservice with db connection', async () => {
    const spyCreate = sandbox.spy(Microservice, 'create');
    const registerMethodsStub = sandbox.stub();
    const beforeStartStub = sandbox.stub();
    const initRemoteMiddlewareStub = sandbox.stub();
    let stubbedStart;
    let addRegisterEndpointSpy;
    let obtainMiddlewares;

    const remoteConfigStub = sandbox.stub(RemoteConfig, 'init');
    const remoteMiddlewareStub = sandbox
      .stub(RemoteMiddlewareClient, 'create')
      .callsFake((...args) => {
        remoteMiddlewareStub.restore();

        const rmMiddleware = RemoteMiddlewareClient.create(...args);

        addRegisterEndpointSpy = sandbox.spy(rmMiddleware, 'addRegisterEndpoint');
        obtainMiddlewares = sandbox.stub(rmMiddleware, 'obtainMiddlewares').resolves();

        return rmMiddleware;
      });

    await startWithDb({
      type: 'microservice',
      msOptions,
      msParams,
      dbOptions,
      hooks: {
        afterCreateMicroservice: (microservice) => {
          stubbedStart = sandbox.stub(microservice, 'start').resolves();
        },
        afterInitRemoteMiddleware: initRemoteMiddlewareStub,
        beforeStart: beforeStartStub,
      },
      registerMethods: registerMethodsStub,
    });

    const [createOptions, createParams] = spyCreate.firstCall.args;

    expect(createOptions).to.deep.equal(msOptions);
    expect(createParams).to.deep.equal(msParams);
    expect(CreateDbConnection).to.calledOnce;
    expect(stubbedStart).to.calledOnce;
    expect(beforeStartStub).to.calledOnce;
    expect(initRemoteMiddlewareStub).to.calledOnce;
    expect(addRegisterEndpointSpy).to.calledOnce;
    expect(obtainMiddlewares).to.calledOnce;
    expect(remoteConfigStub).to.calledOnceWith(Microservice.getInstance(), {
      msName: msOptions.name,
      msConfigName: 'configuration',
    });
    expect(registerMethodsStub).to.calledOnceWith(Microservice.getInstance());
  });

  it('should correctly start gateway', async () => {
    const spyCreate = sandbox.spy(Gateway, 'create');
    let stubbedStart;
    let addRegisterEndpointSpy;
    let addObtainEndpointSpy;

    const remoteMiddlewareStub = sandbox
      .stub(RemoteMiddlewareServer, 'create')
      .callsFake((...args) => {
        remoteMiddlewareStub.restore();

        const rmMiddleware = RemoteMiddlewareServer.create(...args);

        addRegisterEndpointSpy = sandbox.spy(rmMiddleware, 'addRegisterEndpoint');
        addObtainEndpointSpy = sandbox.stub(rmMiddleware, 'addObtainEndpoint');

        return rmMiddleware;
      });

    await start({
      type: 'gateway',
      msOptions,
      msParams,
      remoteMiddleware: {
        isEnable: true,
        type: 'server',
        getRepository: () => ({ this: 'is repository' } as unknown as IMiddlewareRepository),
      },
      remoteConfig: { isEnable: false },
      hooks: {
        afterCreateMicroservice: (gateway) => {
          stubbedStart = sandbox.stub(gateway, 'start').resolves();
        },
      },
    });

    const [createOptions, createParams] = spyCreate.firstCall.args;

    expect(createOptions).to.deep.equal(msOptions);
    expect(createParams).to.deep.equal(msParams);
    expect(stubbedStart).to.calledOnce;
    expect(addRegisterEndpointSpy).to.calledOnce;
    expect(addObtainEndpointSpy).to.calledOnce;
  });

  it('should correctly start microservice without remote middleware & remote config', async () => {
    sandbox.stub(Microservice.getInstance(), 'start').resolves();
    sandbox.stub(RemoteMiddlewareClient, 'instance' as never).value(undefined);

    await start({
      type: 'microservice',
      msOptions,
      msParams,
      remoteMiddleware: { isEnable: false, type: 'client' },
      remoteConfig: { isEnable: false },
    });

    expect(RemoteMiddlewareClient.getInstance()).to.undefined;
    expect(() => RemoteConfig.getInstance()).to.throw('Remote config service should');
  });

  it('should throw error if microservice start failed', async () => {
    sandbox.stub(Microservice.getInstance(), 'start').rejects();

    const res = start({
      type: 'microservice',
      msOptions,
      msParams,
      remoteMiddleware: { isEnable: false, type: 'client' },
      remoteConfig: { isEnable: false },
    });

    expect(await waitResult(res)).to.throw();
  });
});

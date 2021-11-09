import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import sinon from 'sinon';
import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_NAME, MS_CONNECTION } from '@constants/index';
import { start } from '../src';

describe('microservices-name', () => {
  before(() => {
    sinon.stub(console, 'info');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should correct start microservice', async () => {
    const spyCreate = sinon.spy(Microservice, 'create');
    let stubbedStart;
    let isRunBeforeStart = false;
    let addRegisterEndpointSpy;
    let obtainMiddlewares;

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      hooks: {
        afterCreateMicroservice: (microservice) => {
          stubbedStart = sinon.stub(microservice, 'start').resolves();
        },
        afterInitRemoteMiddleware: (remoteMiddleware) => {
          addRegisterEndpointSpy = sinon.spy(remoteMiddleware, 'addRegisterEndpoint');
          obtainMiddlewares = sinon.stub(remoteMiddleware, 'obtainMiddlewares').resolves();
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
    expect(addRegisterEndpointSpy).to.calledOnce;
    expect(obtainMiddlewares).to.calledOnce;
  });

  it('should correct start gateway without remote middleware', async () => {
    sinon.stub(Microservice.getInstance(), 'start').resolves();
    sinon.stub(RemoteMiddlewareClient, 'instance' as any).value(undefined);

    await start({
      msOptions: microserviceOptions,
      msParams: microserviceParams,
      isDisableRemoteMiddleware: true,
    });

    expect(RemoteMiddlewareClient.getInstance()).to.undefined;
  });
});

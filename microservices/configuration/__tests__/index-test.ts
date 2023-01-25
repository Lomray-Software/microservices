import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import MiddlewareRepository from '@repositories/middleware-repository';

describe('microservice: start', () => {
  const sandbox = sinon.createSandbox();
  const run = sandbox.stub();

  rewiremock.proxy(() => require('../src'), {
    '@lomray/microservice-helpers': rewiremock('@lomray/microservice-helpers')
      .callThrough()
      .with({ run }),
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly start microservice', () => {
    const args = run.firstCall.firstArg;

    expect(run).to.calledOnce;
    expect(args).to.have.property('msOptions');
    expect(args).to.have.property('msParams');
    expect(args).to.have.property('registerMethods');
  });

  it('should correctly provide remote middleware repository', () => {
    const {
      remoteMiddleware: { getRepository },
    } = run.firstCall.firstArg;

    expect(getRepository()).to.instanceof(MiddlewareRepository);
  });

  it('should correctly create init configs & middlewares', async () => {
    const {
      hooks: { afterCreateMicroservice },
    } = run.firstCall.firstArg;
    const bulkSaveStub = sandbox.stub();
    const countStub = sandbox.stub();

    TypeormMock.entityManager.getCustomRepository.callsFake(() => ({
      bulkSave: bulkSaveStub,
      count: countStub,
    }));

    await afterCreateMicroservice();

    expect(bulkSaveStub).calledTwice;
  });

  it('should prevent create init configs & middlewares: already exist', async () => {
    const {
      hooks: { afterCreateMicroservice },
    } = run.firstCall.firstArg;
    const bulkSaveStub = sandbox.stub();
    const countStub = sandbox.stub().resolves(1);

    TypeormMock.entityManager.getCustomRepository.callsFake(() => ({
      bulkSave: bulkSaveStub,
      count: countStub,
    }));

    await afterCreateMicroservice();

    expect(bulkSaveStub).not.called;
  });
});

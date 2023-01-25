import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';

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
});

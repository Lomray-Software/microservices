import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';

describe('microservice: start', () => {
  const runStub = sinon.stub();

  rewiremock.proxy(() => require('../src/start'), {
    './index': { start: runStub },
  });

  it('should correctly start microservice', () => {
    const args = runStub.firstCall.firstArg;

    expect(runStub).to.calledOnce;
    expect(args).to.have.property('msOptions');
    expect(args).to.have.property('msParams');
  });
});

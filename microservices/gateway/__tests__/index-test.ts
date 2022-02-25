import { Log } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { msParams } from '@config/ms';

describe('gateway: start', () => {
  const sandbox = sinon.createSandbox();
  const start = sandbox.stub();

  rewiremock.proxy(() => require('../src'), {
    '@lomray/microservice-helpers': rewiremock('@lomray/microservice-helpers')
      .callThrough()
      .with({ start }),
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly start microservice', () => {
    const args = start.firstCall.firstArg;

    expect(start).to.calledOnce;
    expect(args).to.have.property('msOptions');
    expect(args).to.have.property('msParams');
  });

  it('should have microservice custom logger', () => {
    const { logDriver } = msParams;
    const LogInfoSpy = sandbox.spy(Log, 'info');

    if (typeof logDriver !== 'boolean') {
      logDriver?.(() => 'test');
    }

    expect(LogInfoSpy).to.calledOnce;
  });
});

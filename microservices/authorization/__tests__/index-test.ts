import childProcess from 'child_process';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import CONST from '@constants/index';

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
    expect(args).to.have.property('hooks').property('afterCreateMicroservice');
  });

  it('should not import permissions', () => {
    const hook = run.firstCall.firstArg.hooks.afterCreateMicroservice;
    const execStub = sandbox.stub(childProcess, 'execSync');

    hook();

    expect(execStub).to.not.calledOnce;
  });

  it('should correctly import permissions', () => {
    const hook = run.firstCall.firstArg.hooks.afterCreateMicroservice;
    const execStub = sandbox.stub(childProcess, 'execSync');

    sandbox.stub(CONST, 'MS_IMPORT_PERMISSION').value(1);

    hook();

    expect(execStub).to.calledOnce;
  });
});

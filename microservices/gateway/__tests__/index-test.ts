import { Gateway } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import { MS_NAME, MS_CONNECTION } from '@constants/environment';

describe('gateway', () => {
  const microservice = Gateway.create();

  const spyCreate = sinon.spy(Gateway, 'create');
  const stubbedStart = sinon.stub(microservice, 'start').resolves();

  after(() => {
    sinon.restore();
  });

  it('should correct start gateway microservice', async () => {
    await import('../src/index');

    const createOptions = spyCreate.firstCall.firstArg;

    expect(createOptions).to.includes({ name: MS_NAME, connection: MS_CONNECTION });
    expect(stubbedStart).to.calledOnce;
  });
});

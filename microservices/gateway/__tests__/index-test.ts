import { Gateway } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import { MICROSERVICE_NAME, IJSON_CONNECTION } from '@constants/environment';

describe('gateway', () => {
  const microservice = Gateway.create();

  const spyCreate = sinon.spy(Gateway, 'create');
  const stubbedStart = sinon.stub(microservice, 'start').resolves();

  after(() => {
    sinon.restore();
  });

  it('should correct start microservice', async () => {
    await import('../src/index');

    const createOptions = spyCreate.firstCall.firstArg;

    expect(createOptions).to.includes({ name: MICROSERVICE_NAME, connection: IJSON_CONNECTION });
    expect(stubbedStart).to.calledOnce;
  });
});

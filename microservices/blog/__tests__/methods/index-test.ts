import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import registerMethods from '@methods/index';

describe('methods/register', () => {
  const sandbox = sinon.createSandbox();
  const ms = Microservice.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly register microservice methods', () => {
    const addEndpointStub = sandbox.spy(ms, 'addEndpoint');

    registerMethods(ms);

    expect(addEndpointStub).to.called;
  });
});

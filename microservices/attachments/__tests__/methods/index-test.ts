import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import registerMethods from '@methods/index';

describe('methods/register', () => {
  const ms = Microservice.create();

  it('should correctly register microservice methods', () => {
    const addEndpointStub = sinon.spy(ms, 'addEndpoint');

    registerMethods(ms);

    expect(addEndpointStub).to.called;
  });
});

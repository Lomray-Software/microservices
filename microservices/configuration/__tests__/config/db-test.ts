import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import TypeormMock from '@__mocks__/typeorm';
import TypeormExtensionMock from '@__mocks__/typeorm-extension';

const { createDbConnection, connectionDbOptions } = rewiremock.proxy(() => require('@config/db'), {
  typeorm: TypeormMock.mock,
  'typeorm-extension': TypeormExtensionMock.mock,
});

describe('config/db', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
    TypeormExtensionMock.sandbox.reset();
  });

  before(() => {
    sinon.stub(console, 'info');
  });

  after(() => {
    sinon.restore();
  });

  it('should correct create db connection', async () => {
    await createDbConnection(connectionDbOptions);

    expect(TypeormExtensionMock.stubs.createDatabase).to.calledOnce;
    expect(TypeormMock.stubs.createConnection).to.calledOnce;
  });
});

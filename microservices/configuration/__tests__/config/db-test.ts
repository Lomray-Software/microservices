import TypeormMock from '@lomray/microservice-helpers/mocks/typeorm';
import TypeormExtensionMock from '@lomray/microservice-helpers/mocks/typeorm-extension';
import { expect } from 'chai';
import rewiremock from 'rewiremock';

const { createDbConnection, connectionDbOptions } = rewiremock.proxy(() => require('@config/db'), {
  typeorm: TypeormMock.mock,
  'typeorm-extension': TypeormExtensionMock.mock,
});

describe('config/db', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
    TypeormExtensionMock.sandbox.resetHistory();
  });

  it('should correct create db connection', async () => {
    await createDbConnection(connectionDbOptions);

    expect(TypeormExtensionMock.stubs.createDatabase).to.calledOnce;
    expect(TypeormMock.stubs.createConnection).to.calledOnce;
  });
});

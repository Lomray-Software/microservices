import { TypeormMock, TypeormExtensionMock } from '@lomray/microservice-helpers/mocks';
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

  it('should correctly create db connection', async () => {
    await createDbConnection(connectionDbOptions);

    expect(TypeormExtensionMock.stubs.createDatabase).to.calledOnce;
    expect(TypeormMock.stubs.createConnection).to.calledOnce;
  });
});

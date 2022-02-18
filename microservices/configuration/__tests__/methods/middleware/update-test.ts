import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { MiddlewareType } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareServer } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';
import OriginalMiddlewareUpdate from '@methods/middleware/update';

const { default: Update } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareUpdate;
}>(() => require('@methods/middleware/update'), {
  typeorm: TypeormMock.mock,
});

describe('methods/middleware/update', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('should correctly update entity', async () => {
    const entity = getRepository(Middleware).create({
      id: 1,
      sender: 'sender',
      senderMethod: 'senderMethod',
      target: 'target',
      targetMethod: 'targetMethod',
      type: MiddlewareType.request,
    });
    const fields = { target: 'target2' };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);
    const remoteRegisterStub = sandbox.stub(RemoteMiddlewareServer.getInstance(), 'remoteRegister');

    const res = await Update({ fields, query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(fields);
    expect(remoteRegisterStub).to.calledOnce;
  });
});

import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { RemoteMiddlewareServer } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalMiddlewareRemove from '@methods/middleware/remove';

const { default: Remove } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareRemove;
}>(() => require('@methods/middleware/remove'), {
  typeorm: TypeormMock.mock,
});

describe('methods/middleware/remove', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('should correctly remove entity', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    const remoteRegisterStub = sandbox.stub(RemoteMiddlewareServer.getInstance(), 'remoteRegister');

    const res = await Remove({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
    expect(remoteRegisterStub).to.calledOnce;
  });
});

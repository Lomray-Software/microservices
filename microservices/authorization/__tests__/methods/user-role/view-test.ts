import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import View from '@methods/user-role/view';
import EndpointHandler from '@services/endpoint-handler';

describe('methods/user-role/my', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return user role from payload', async () => {
    const payload = { authorization: { roles: ['guest'] } };

    const res = await View({ payload }, endpointOptions);

    expect(res).to.deep.equal(payload.authorization);
  });

  it('should correctly return user role by userId', async () => {
    const userId = 'sample-id';
    const roles = ['sample-role'];

    const endpointHandlerInitStub = sandbox
      .stub(EndpointHandler, 'init')
      .callsFake((method, params) => {
        endpointHandlerInitStub.restore();

        const endpointHandlerService = EndpointHandler.init(method, params);
        const enforcer = endpointHandlerService.getEnforcer();

        sandbox.stub(enforcer, 'findUserRoles').resolves({ userId, roles });

        return endpointHandlerService;
      });

    const res = await View({ userId }, endpointOptions);

    expect(res).to.deep.equal({ roles });
  });
});

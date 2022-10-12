import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { signOut as OriginalEndpointSignOut } from '@methods/user/sign-out';

const { signOut: SignOut } = rewiremock.proxy<{
  signOut: typeof OriginalEndpointSignOut;
}>(() => require('@methods/user/sign-out'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/sign-out', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw validation error', async () => {
    const res = SignOut({ userId: '' }, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly sign out', async () => {
    const res = await SignOut({ userId: 'user-id' }, endpointOptions);

    expect(res).to.deep.equal({ loggedOut: true });
  });
});

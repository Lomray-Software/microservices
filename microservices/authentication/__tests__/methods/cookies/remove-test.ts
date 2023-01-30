import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import cookiesMock from '@__mocks__/cookies';
import RemoveCookies from '@methods/cookies/remove';

describe('methods/cookies/remove', () => {
  it('should return payload with cookies remove data', async () => {
    const result = await RemoveCookies({}, endpointOptions);

    expect(result).to.deep.equal({
      isRemoved: true,
      payload: {
        cookies: [{ action: 'remove', name: 'jwt-access', options: { ...cookiesMock } }],
      },
    });
  });
});

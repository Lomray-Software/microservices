import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import My from '@methods/user-role/my';

describe('methods/user-role/my', () => {
  it('should correctly return user role from payload', async () => {
    const payload = { authorization: { roles: ['guest'] } };

    const res = await My({ payload }, endpointOptions);

    expect(res).to.deep.equal(payload.authorization);
  });
});

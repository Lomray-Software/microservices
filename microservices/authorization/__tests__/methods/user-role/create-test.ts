import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  createResult,
  endpointOptions,
  waitResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalUserRoleAssign from '@methods/user-role/assign';

const { default: Assign } = rewiremock.proxy<{
  default: typeof OriginalUserRoleAssign;
}>(() => require('@methods/user-role/assign'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/create', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly assign role', async () => {
    const res = await Assign({ fields: { userId: 'test', roleAlias: 'users' } }, endpointOptions);

    expect(res).to.deep.equal(createResult({}));
  });

  it('should throw error when we pass empty fields', async () => {
    const failedInput = Assign({ fields: {} }, endpointOptions);
    // @ts-ignore
    const failedInput2 = Assign({ fields: null }, endpointOptions);
    const failedInput3 = Assign({ fields: {} }, endpointOptions);

    expect(await waitResult(failedInput)).to.throw();
    expect(await waitResult(failedInput2)).to.throw();
    expect(await waitResult(failedInput3)).to.throw();
  });
});

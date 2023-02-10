import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { checkUsername as OriginalEndpointCheckUsername } from '@methods/user/check-username';

const { checkUsername: CheckUsername } = rewiremock.proxy<{
  checkUsername: typeof OriginalEndpointCheckUsername;
}>(() => require('@methods/user/check-username'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/check-username', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = CheckUsername({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly check username: exist', async () => {
    TypeormMock.entityManager.findOne.resolves({ id: 'userId' });

    const res = await CheckUsername({ username: 'username' }, endpointOptions);

    expect(res?.isUnique).to.false;
  });

  it('should correctly check username: not exist', async () => {
    TypeormMock.entityManager.findOne.resolves(null);

    const res = await CheckUsername({ username: 'username' }, endpointOptions);

    expect(res?.isUnique).to.true;
  });
});

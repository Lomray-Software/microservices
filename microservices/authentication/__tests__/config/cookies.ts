import { expect } from 'chai';
import sinon from 'sinon';
import cookiesMock from '@__mocks__/cookies';
import cookies from '@config/cookies';

describe('config/cookies', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return cookies config: with remote', async () => {
    expect(await cookies()).to.deep.equal(cookiesMock);
  });
});

import { expect } from 'chai';
import sinon from 'sinon';
import remoteConfig from '@config/remote';
import CONST from '@constants/index';

describe('config/remote', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return cookies config: with remote', async () => {
    expect(await remoteConfig()).to.deep.equal({
      defaultRole: CONST.MS_DEFAULT_ROLE_ALIAS,
    });
  });
});

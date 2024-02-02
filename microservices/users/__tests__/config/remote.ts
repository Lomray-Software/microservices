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
      changePasswordClearTokensType: CONST.MS_USER_CHANGE_PASSWORD_CLEAR_TOKENS_TYPE,
      passwordSaltRounds: CONST.MS_USER_PASSWORD_SALT_ROUNDS,
      removedAccountRestoreTime: CONST.MS_USER_REMOVE_ACCOUNT_RESTORE_TIME,
    });
  });
});

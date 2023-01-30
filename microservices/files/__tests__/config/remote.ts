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
      imageProcessingConfig: {},
      localStoragePath: CONST.LOCAL_STORAGE_PATH,
      storageDomain: '',
      storagePathPrefix: '',
      storageType: CONST.MS_STORAGE_TYPE,
    });
  });
});

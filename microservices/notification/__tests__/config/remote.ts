import { expect } from 'chai';
import sinon from 'sinon';
import remoteConfig from '@config/remote';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

describe('config/remote', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return cookies config: with remote', async () => {
    expect(await remoteConfig()).to.deep.equal({
      defaultEmailFrom: CONST.EMAIL_DEFAULT_FROM,
      emailProvider: CONST.EMAIL_PROVIDER as IRemoteConfig['emailProvider'],
      transportOptions: CONST.EMAIL_TRANSPORTER_OPTIONS as IRemoteConfig['transportOptions'],
    });
  });
});

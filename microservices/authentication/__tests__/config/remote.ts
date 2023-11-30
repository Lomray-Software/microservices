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
      jwtOptions: { ...CONST.MS_JWT_PARAMS, secretKey: CONST.MS_JWT_SECRET_KEY },
      cookieOptions: {
        httpOnly: CONST.IS_HTTPONLY_COOKIE,
        secure: CONST.IS_SECURE_COOKIE,
        sameSite: CONST.COOKIE_SAME_SITE,
        domain: CONST.COOKIE_DOMAIN,
      },
      cookieStrategy: CONST.COOKIE_AUTH_STRATEGY,
    });
  });
});

import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import getJwtConfig from '@config/jwt';

describe('config/jwt', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return jwt config: with remote', async () => {
    const remoteConfig = { secretKey: 'remote-key' };

    sandbox.stub(RemoteConfig, 'get').resolves({ jwtOptions: remoteConfig });

    expect(await getJwtConfig()).to.deep.equal(remoteConfig);
  });

  it('should correctly return jwt config: with audience', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ jwtOptions: {} });

    expect(await getJwtConfig(['aud-1'])).to.deep.equal({
      options: { audience: ['aud-1'] },
      secretKey: undefined,
    });
  });

  it('should correctly return jwt config: with audience merged', async () => {
    sandbox
      .stub(RemoteConfig, 'get')
      .resolves({ jwtOptions: { options: { audience: ['aud-remote-1'] } } });

    expect(await getJwtConfig(['aud-1'])).to.deep.equal({
      options: { audience: ['aud-remote-1', 'aud-1'] },
      secretKey: undefined,
    });
  });
});

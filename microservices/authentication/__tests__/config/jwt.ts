import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import getJwtConfig from '@config/jwt';

describe('config/jwt', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return jwt config: without remote', async () => {
    expect(await getJwtConfig(false)).to.have.property('secretKey');
  });

  it('should correctly return jwt config: with remote', async () => {
    const remoteConfig = { secretKey: 'remote-key' };

    sandbox.stub(RemoteConfig, 'get').resolves({ jwtOptions: remoteConfig });

    expect(await getJwtConfig()).to.deep.equal(remoteConfig);
  });
});

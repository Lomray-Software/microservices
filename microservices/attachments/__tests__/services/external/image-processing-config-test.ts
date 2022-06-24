import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import ImageProcessingConfig from '@services/external/image-processing-config';

describe('services/external/s3-aws-sdk', () => {
  const config = {
    thumbnails: [{ name: 'name', options: { width: 100 } }],
    outputOptions: { jpeg: { quality: 80 } },
  };

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully create instance with options', async () => {
    ImageProcessingConfig.reset();

    const configMs = await ImageProcessingConfig.get({ isFromConfigMs: 0, config });

    expect(configMs).to.deep.equal(config);
  });

  it('should successfully create instance with remote config', async () => {
    ImageProcessingConfig.reset();

    const fromRemoteConfig = {
      thumbnails: [{ name: 'name', options: { width: 100 } }],
      outputOptions: { jpeg: { quality: 80 } },
    };

    sandbox.stub(RemoteConfig, 'get').resolves(fromRemoteConfig);

    const remoteConfig = await ImageProcessingConfig.get({
      isFromConfigMs: 1,
      config,
    });

    expect(remoteConfig).to.deep.equal(fromRemoteConfig);
  });
});

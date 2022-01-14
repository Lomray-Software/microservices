import { BaseException, Microservice, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import RemoteConfig from '@services/remote-config';
import waitResult from '@test-helpers/wait-result';

describe('services/remote-config', () => {
  const sandbox = sinon.createSandbox();
  const ms = Microservice.create();
  const params = {
    msName: 'msName',
    msConfigName: 'msConfigName',
  };
  const result = { param: 1 };
  const otherParams = { other: true };

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error if try obtain config without create instance', () => {
    expect(() => RemoteConfig.getInstance()).to.throw('Remote config service should');
  });

  it('should correctly instantiate', () => {
    const config = RemoteConfig.create(ms, params);

    expect(config).instanceof(RemoteConfig);
  });

  it('should return null if cached config not exist', () => {
    expect(RemoteConfig.getSync('db')).to.null;
  });

  it('should correctly get remote config', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: { params: result },
      }),
    );

    const res = await RemoteConfig.get('db');

    expect(res).to.deep.equal(result);
  });

  it('should correctly get cached config', async () => {
    const res1 = RemoteConfig.getSync('db');
    const res2 = await RemoteConfig.get('db');

    expect(res1).to.deep.equal(result);
    expect(res2).to.deep.equal(result);
  });

  it('should correctly force get cached config', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: { params: otherParams },
      }),
    );

    const res = await RemoteConfig.get('db', { isForce: true });

    expect(res).to.deep.equal(otherParams);
  });

  it('should throw error if remote config is not available', async () => {
    sandbox.stub(ms, 'sendRequest').rejects(new BaseException({ message: 'Not Available' }));

    const res = RemoteConfig.get('ms-conf');

    expect(await waitResult(res)).to.throw('Not Available');
  });

  it('should throw error if remote config is not available', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: {},
      }),
    );

    const res = RemoteConfig.get('ms-conf', { isThrowNotExist: true });

    expect(await waitResult(res)).to.throw('Configuration for param');
  });
});

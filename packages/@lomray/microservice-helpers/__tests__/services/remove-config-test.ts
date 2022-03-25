import { BaseException, Microservice, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import RemoteConfig from '@services/remote-config';
import { viewResult } from '@test-helpers/mock-args';
import waitResult from '@test-helpers/wait-result';

describe('services/remote-config', () => {
  const sandbox = sinon.createSandbox();
  const ms = Microservice.create();
  const params = {
    msName: 'msName',
    msConfigName: 'msConfigName',
    resetCacheEndpoint: 'reset-cache',
  };
  const result = { param: 1 };
  const otherParams = { other: true };
  let msAddEndpointStub: SinonStub | undefined;

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error if try obtain config without create instance', () => {
    expect(() => RemoteConfig.getInstance()).to.throw('Remote config service should');
  });

  it('should correctly instantiate', () => {
    msAddEndpointStub = sandbox.stub(ms, 'addEndpoint');

    RemoteConfig.init(ms, params);

    expect(RemoteConfig.getInstance()).instanceof(RemoteConfig);
  });

  it('should return null if cached config not exist', () => {
    expect(RemoteConfig.getCachedSync('db')).to.null;
  });

  it('should correctly get remote config', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: viewResult({ params: result }),
      }),
    );

    const res = await RemoteConfig.get('db');

    expect(res).to.deep.equal(result);
  });

  it('should correctly get common remote config if personal not exist', async () => {
    const stub = sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: viewResult({ params: result }),
      }),
    );

    const res = await RemoteConfig.get('common', { isCommon: true });
    const [, condition] = stub.firstCall.args;

    expect(res).to.deep.equal(result);
    expect(condition).to.deep.equal({
      query: {
        where: {
          or: [
            {
              microservice: 'msName',
            },
            {
              microservice: '*',
            },
          ],
          type: 'common',
        },
      },
    });
  });

  it('should correctly get cached config', async () => {
    const res1 = RemoteConfig.getCachedSync('db');
    const res2 = await RemoteConfig.get('db');

    expect(res1).to.deep.equal(result);
    expect(res2).to.deep.equal(result);
  });

  it('should correctly force get cached config', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: viewResult({ params: otherParams }),
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

  it('should throw error if remote config is not exist', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: {},
      }),
    );

    const res = RemoteConfig.get('ms-conf', { isThrowNotExist: true });

    expect(await waitResult(res)).to.throw('Configuration for param');
  });

  it('should throw error if remote config return error', async () => {
    sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        error: new BaseException({ message: 'Some message' }),
      }),
    );

    const res = RemoteConfig.get('ms-conf');

    expect(await waitResult(res)).to.throw('Some message');
  });

  it('should have reset cache endpoint', async () => {
    const [endpoint, handler] = msAddEndpointStub?.firstCall.args ?? [];
    const cachedResult = RemoteConfig.getCachedSync('db');

    const res = await handler();

    expect(endpoint).to.equal(params.resetCacheEndpoint);
    expect(cachedResult).to.not.deep.equal({}); // not empty
    expect(res).to.deep.equal({ isReset: true });
    expect(RemoteConfig.getCachedSync('db')).to.null; // success reset cache
  });
});

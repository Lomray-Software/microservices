import FirebaseSdk from '@lomray/microservice-helpers/services/firebase-sdk';
import { expect } from 'chai';
import sinon from 'sinon';
import Firebase from '@services/external/firebase-sdk';

describe('services/external/firebase-sdk', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should init and return firebase sdk', async () => {
    const stubInit = sandbox.stub(FirebaseSdk, 'init');
    const stubGet = sandbox.stub(FirebaseSdk, 'get');

    await Firebase();

    expect(stubInit).to.calledOnce;
    expect(stubGet).to.calledOnce;
  });
});

import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { configMock } from '@__mocks__/config';
import * as remoteConfig from '@config/remote';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

describe('services/payment-gateway/factory', () => {
  const remoteConfigMock = {
    config: {
      apiVersion: '2022-11-15',
    },
    paymentMethods: ['bancontact', 'card'],
    apiKey: 'fake-api-key',
    ...configMock,
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should create a Stripe instance with the provided parameters', async () => {
    const remoteConfigStub = sinon.stub().resolves(remoteConfigMock);

    sinon.replace(remoteConfig, 'default', remoteConfigStub);

    const stripeInstance = await Factory.create(TypeormMock.entityManager);

    expect(stripeInstance).to.be.an.instanceOf(Stripe);
  });

  it('should throw error: invalid payment options or api key or payment methods', async () => {
    const configs = [
      {},
      { apikey: remoteConfigMock.apiKey },
      { config: remoteConfigMock.config },
      { paymentMethods: remoteConfigMock.paymentMethods },
    ];

    for (const config of configs) {
      const remoteConfigStub = sinon.stub().resolves(config);

      sinon.replace(remoteConfig, 'default', remoteConfigStub);
      sinon.restore();

      expect(await waitResult(Factory.create(TypeormMock.entityManager))).to.throw(
        'Payment options or api key or payment methods for stripe are not provided',
      );
    }
  });
});

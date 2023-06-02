import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Stripe as StripeTypes } from 'stripe';
import OriginalStripe from '@services/payment-gateway/stripe';

const StripeSdkStub = sinon.stub();

const { default: Stripe } = rewiremock.proxy<{
  default: typeof OriginalStripe;
}>(() => require('@services/payment-gateway/stripe'), {
  stripe: StripeSdkStub,
});

describe('services/payment-gateway/stripe', () => {
  const sandbox = sinon.createSandbox();
  const config: StripeTypes.StripeConfig = {
    apiVersion: '2022-11-15',
  };
  const userIdMock = 'user-id';
  const customerMock = {
    id: 'cus_NshmwHkITU8Egm',
    object: 'customer',
    description: 'Mike',
  };

  const stripeMock = () => ({
    customers: {
      create: () => customerMock,
    },
  });

  const service = new Stripe(TypeormMock.entityManager, 'api-key', config, ['bancontact', 'card']);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    StripeSdkStub.reset();
    sandbox.restore();
  });

  it('should correctly create customer', async () => {
    /**
     * @TODO: Investigate why resolves isn't stub correct mock result
     */
    StripeSdkStub.resolves(stripeMock());
    const { userId, customerId } = await service.createCustomer(userIdMock);

    expect(userId).to.equal(userIdMock);
    expect(customerId).to.equal(customerMock.id);
    expect(TypeormMock.entityManager.save).to.calledOnce;
  });
});

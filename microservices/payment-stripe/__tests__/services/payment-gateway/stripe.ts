import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { Stripe as StripeTypes } from 'stripe';
import {
  customerMock,
  accountMock,
  accountLinkMock,
  clientSecretMock,
  balancesMock,
} from '@__mocks__/stripe';
import StripeAccountTypes from '@constants/stripe-account-types';
import OriginalStripe from '@services/payment-gateway/stripe';

describe('services/payment-gateway/stripe', () => {
  const sandbox = sinon.createSandbox();
  const config: StripeTypes.StripeConfig = {
    apiVersion: '2022-11-15',
  };
  const accountUrlMock = 'https://mike.com/account';
  const userMock = {
    customerId: customerMock.id,
    userId: 'user-id',
    params: { accountId: accountMock.id },
  };

  const stripeMock = () => ({
    customers: {
      create: () => customerMock,
    },
    accountLinks: {
      create: () => accountLinkMock,
    },
    accounts: {
      create: () => accountMock,
    },
    balance: {
      retrieve: () => balancesMock,
    },
    setupIntents: {
      create: () => ({
        // eslint-disable-next-line camelcase
        client_secret: clientSecretMock,
      }),
    },
  });

  const service = new OriginalStripe(TypeormMock.entityManager, 'api-key', config, [
    'bancontact',
    'card',
  ]);

  /**
   * This field is protected
   */
  // @ts-ignore
  sinon.stub(service, 'sdk').value(stripeMock());

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly create customer', async () => {
    const { userId, customerId } = await service.createCustomer(userMock.userId);

    expect(userId).to.equal(userMock.userId);
    expect(customerId).to.equal(customerMock.id);
    expect(TypeormMock.entityManager.save).to.calledOnce;
  });

  it('should correctly return account link', async () => {
    TypeormMock.entityManager.findOne.resolves(userMock);

    const accountLink = await service.getConnectAccountLink(
      userMock.userId,
      accountUrlMock,
      accountUrlMock,
    );

    expect(accountLink).to.equal(accountLinkMock.url);
  });

  it("should should throw error: customer isn't found", async () => {
    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(
      await waitResult(
        service.getConnectAccountLink(userMock.userId, accountUrlMock, accountUrlMock),
      ),
    ).to.throw("Customer isn't found");
  });

  it("should should throw error: customer don't have setup connect account", async () => {
    TypeormMock.entityManager.findOne.resolves({ ...userMock, params: {} });

    expect(
      await waitResult(
        service.getConnectAccountLink(userMock.userId, accountUrlMock, accountUrlMock),
      ),
    ).to.throw("Customer don't have setup connect account");
  });

  it('should correctly return setup intent client secret', async () => {
    TypeormMock.entityManager.findOne.resolves(userMock);

    const clientSecret = await service.setupIntent(userMock.userId);

    expect(clientSecret).to.equal(clientSecretMock);
  });

  it("should correctly return setup intent client secret if customer isn't exist", async () => {
    TypeormMock.entityManager.findOne.resolves(undefined);

    const clientSecret = await service.setupIntent(userMock.userId);

    expect(clientSecret).to.equal(clientSecretMock);
  });

  it('should correctly crete connect account and return link for different users', async () => {
    const users = [userMock, { ...userMock, params: {} }];

    for (const user of users) {
      TypeormMock.entityManager.findOne.resolves(user);

      const accountLink = await service.connectAccount(
        userMock.userId,
        'mike@gmail.com',
        StripeAccountTypes.STANDARD,
        accountUrlMock,
        accountUrlMock,
      );

      expect(accountLink).to.equal(accountLinkMock.url);
    }
  });

  it('should correctly return customer balance', async () => {
    TypeormMock.entityManager.findOne.resolves(userMock);

    const balance = await service.getBalance(userMock.userId);

    expect(balance).to.deep.equal({
      available: {
        eur: 0,
        usd: 1000,
      },
      instant: {
        eur: 0,
        usd: 0,
      },
      pending: {
        eur: 0,
        usd: 0,
      },
    });
  });

  it("should return error (balance): customer isn't found", async () => {
    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.getBalance(userMock.userId))).to.throw("Customer isn't found");
  });

  it("should should throw error (balance): customer don't have related connect account", async () => {
    TypeormMock.entityManager.findOne.resolves({ ...userMock, params: {} });

    expect(await waitResult(service.getBalance(userMock.userId))).to.throw(
      "Customer don't have related connect account",
    );
  });
});

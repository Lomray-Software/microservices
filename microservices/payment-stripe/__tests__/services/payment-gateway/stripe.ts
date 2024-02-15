import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import StripeSdk, { Stripe as StripeTypes } from 'stripe';
import { cardMock } from '@__mocks__/card';
import { configMock } from '@__mocks__/config';
import messages from '@__mocks__/messages';
import {
  accountLinkMock,
  accountMock,
  balancesMock,
  clientSecretMock,
  customerMock,
  paymentMethodId,
} from '@__mocks__/stripe';
import * as remoteConfig from '@config/remote';
import StripeAccountTypes from '@constants/stripe-account-types';
import OriginalStripe from '@services/payment-gateway/stripe';

interface IStripeMockParams {
  isDeletedCustomer?: boolean;
  customersUpdateResult?: Partial<StripeSdk.Customer>;
}

describe('services/payment-gateway/stripe', () => {
  const sandbox = sinon.createSandbox();
  const config: StripeTypes.StripeConfig = {
    apiVersion: '2022-11-15',
  };
  const remoteConfigMock = {
    config: {
      apiVersion: '2022-11-15',
    },
    paymentMethods: ['bancontact', 'card'],
    apiKey: 'fake-api-key',
    ...configMock,
  };
  const accountUrlMock = 'https://mike.com/account';
  const userMock = {
    customerId: customerMock.id,
    userId: 'user-id',
    params: { accountId: accountMock.id },
  };
  const defaultStripeMockParams = {
    isDeletedCustomer: true,
    customersUpdateResult: customerMock,
  };

  const stripeMock = ({
    isDeletedCustomer,
    customersUpdateResult,
  }: IStripeMockParams = defaultStripeMockParams) => ({
    customers: {
      create: () => customerMock,
      del: () => ({
        deleted: isDeletedCustomer,
      }),
      update: () => customersUpdateResult,
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
  const StripeInstanceParamStub = sinon.stub(service, 'sdk');

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('init', () => {
    it('should create a Stripe instance with the provided parameters', async () => {
      const remoteConfigStub = sandbox.stub().resolves(remoteConfigMock);

      sinon.replace(remoteConfig, 'default', remoteConfigStub);

      const stripeInstance = await OriginalStripe.init(TypeormMock.entityManager);

      sinon.restore();
      expect(stripeInstance).to.be.an.instanceOf(OriginalStripe);
    });

    it('should throw error: invalid payment options or api key or payment methods', async () => {
      const configs = [
        {},
        { apikey: remoteConfigMock.apiKey },
        { config: remoteConfigMock.config },
        { paymentMethods: remoteConfigMock.paymentMethods },
      ];

      for (const conf of configs) {
        const remoteConfigStub = sandbox.stub().resolves(conf);

        sinon.replace(remoteConfig, 'default', remoteConfigStub);
        sinon.restore();

        expect(await waitResult(OriginalStripe.init(TypeormMock.entityManager))).to.throw(
          'Payment options or api key or payment methods for stripe are not provided',
        );
      }
    });
  });

  describe('core', () => {
    it('should correctly create customer', async () => {
      StripeInstanceParamStub.value(stripeMock());
      const { userId, customerId } = await service.createCustomer(userMock.userId);

      expect(userId).to.equal(userMock.userId);
      expect(customerId).to.equal(customerMock.id);
      expect(TypeormMock.entityManager.save).to.calledOnce;
    });

    it('should correctly return account link', async () => {
      StripeInstanceParamStub.value(stripeMock());
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
      ).to.throw(messages.customerIsNotFound);
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
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(userMock);

      const clientSecret = await service.setupIntent(userMock.userId);

      expect(clientSecret).to.equal(clientSecretMock);
    });

    it("should correctly return setup intent client secret if customer isn't exist", async () => {
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(undefined);

      const clientSecret = await service.setupIntent(userMock.userId);

      expect(clientSecret).to.equal(clientSecretMock);
    });

    it('should correctly crete connect account and return link for different users', async () => {
      const users = [userMock, { ...userMock, params: {} }];

      for (const user of users) {
        StripeInstanceParamStub.value(stripeMock());
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
      StripeInstanceParamStub.value(stripeMock());
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
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(undefined);

      expect(await waitResult(service.getBalance(userMock.userId))).to.throw(
        "Customer isn't found",
      );
    });

    it("should should throw error (balance): customer don't have related connect account", async () => {
      TypeormMock.entityManager.findOne.resolves({ ...userMock, params: {} });

      expect(await waitResult(service.getBalance(userMock.userId))).to.throw(
        "Customer don't have related connect account",
      );
    });

    it('should multiply the amount by 100 for valid inputs', () => {
      const testCases = [
        { input: 10, expected: 1000 },
        { input: '20.5', expected: 2050 },
        { input: ' 30.75 ', expected: 3075 },
        { input: '1000.25', expected: 100025 },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = service.toSmallestCurrencyUnit(input);

        expect(result).to.equal(expected);
      });
    });

    it('should return NaN for invalid inputs', () => {
      const testCases = ['invalid', '1.2.3'];

      testCases.forEach((input) => {
        const result = service.toSmallestCurrencyUnit(input);

        expect(result).to.be.NaN;
      });
    });

    it('should correctly remove customer', async () => {
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(userMock);

      const isRemoved = await service.removeCustomer(userMock.userId);

      expect(isRemoved).to.true;
    });

    it("shouldn't remove customer cause stripe remove failed", async () => {
      StripeInstanceParamStub.value(stripeMock({ isDeletedCustomer: false }));
      TypeormMock.entityManager.findOne.resolves(userMock);

      const isRemoved = await service.removeCustomer(userMock.userId);

      expect(isRemoved).to.false;
    });

    it("should return error (remove customer): customer isn't found", async () => {
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(undefined);

      expect(await waitResult(service.removeCustomer(userMock.userId))).to.throw(
        messages.customerIsNotFound,
      );
    });

    it('should correctly add bank account customer', async () => {
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(userMock);

      const bankAccount = {
        userId: userMock.userId,
        bankAccountId: 'bank-account-id',
        bankName: 'American Express',
        holderName: 'Mike',
        lastDigits: '4242',
      };

      TypeormMock.entityManager.save.resolves(bankAccount);

      const result = await service.addBankAccount(bankAccount);

      expect(result).to.deep.equal(bankAccount);
    });

    it("should return error (add bank account): customer isn't found", async () => {
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves(undefined);

      expect(await waitResult(service.removeCustomer(userMock.userId))).to.throw(
        messages.customerIsNotFound,
      );
    });

    it('should correctly set payment method', async () => {
      StripeInstanceParamStub.value(
        stripeMock({
          customersUpdateResult: {
            ...customerMock,
            // eslint-disable-next-line camelcase
            invoice_settings: {
              // eslint-disable-next-line camelcase
              default_payment_method: paymentMethodId,
            },
          } as StripeSdk.Customer,
        }),
      );
      TypeormMock.entityManager.findOne.resolves({
        ...cardMock,
        params: { paymentMethodId },
        customer: userMock,
      });

      const isSet = await service.setDefaultCustomerPaymentMethod(
        userMock.customerId as string,
        'payment-method-id',
      );

      expect(isSet).to.true;
    });

    it("shouldn't correctly set payment method", async () => {
      StripeInstanceParamStub.value(stripeMock());
      TypeormMock.entityManager.findOne.resolves({
        ...cardMock,
        params: { paymentMethodId },
        customer: userMock,
      });

      const isSet = await service.setDefaultCustomerPaymentMethod(
        userMock.customerId as string,
        'payment-method-id',
      );

      expect(isSet).to.false;
    });
  });
});

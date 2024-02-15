import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import type StripeSdk from 'stripe';
import { configMock } from '@__mocks__/config';
import * as remoteConfig from '@config/remote';
import TaxBehaviour from '@constants/tax-behaviour';
import TransactionRole from '@constants/transaction-role';
import Calculation from '@services/calculation';

describe('services/calculation', () => {
  const sandbox = sinon.createSandbox();
  const mathRoundSpy = sinon.spy(Math, 'round');
  const remoteConfigStub = sinon.stub().resolves(configMock);

  sinon.replace(remoteConfig, 'default', remoteConfigStub);

  beforeEach(() => {
    TypeormMock.entityManager.restore();
  });

  afterEach(() => {
    mathRoundSpy.restore();
    sinon.restore();
    sandbox.restore();
  });

  describe('getPaymentIntentFees', () => {
    it('should correctly compute payment intent fees', async () => {
      const expectedResult = {
        platformUnitFee: 0,
        extraReceiverUnitRevenue: 0,
        stripeUnitFee: 61,
        receiverAdditionalFee: 0,
        receiverUnitRevenue: 1000,
        senderAdditionalFee: 0,
        userUnitAmount: 1061,
      };

      expect(
        await Calculation.getPaymentIntentFees({
          feesPayer: TransactionRole.SENDER,
          entityUnitCost: 1000,
        }),
      ).to.deep.equal(expectedResult);
    });

    it('should correctly compute payment intent fees with application fees', async () => {
      const expectedResult = {
        platformUnitFee: 30,
        extraReceiverUnitRevenue: 0,
        stripeUnitFee: 62,
        receiverAdditionalFee: 0,
        receiverUnitRevenue: 1000,
        senderAdditionalFee: 0,
        userUnitAmount: 1092,
      };

      expect(
        await Calculation.getPaymentIntentFees({
          feesPayer: TransactionRole.SENDER,
          entityUnitCost: 1000,
          applicationPaymentPercent: 3,
        }),
      ).to.deep.equal(expectedResult);
    });

    it('should correctly compute payment intent fees with application  and receiver additional fees', async () => {
      const expectedResult = {
        platformUnitFee: 30,
        extraReceiverUnitRevenue: 0,
        stripeUnitFee: 62,
        receiverAdditionalFee: 60,
        receiverUnitRevenue: 940,
        senderAdditionalFee: 0,
        userUnitAmount: 1092,
      };

      expect(
        await Calculation.getPaymentIntentFees({
          feesPayer: TransactionRole.SENDER,
          entityUnitCost: 1000,
          applicationPaymentPercent: 3,
          additionalFeesPercent: {
            receiver: 6,
            sender: 0,
          },
        }),
      ).to.deep.equal(expectedResult);
    });
  });

  describe('getStripeFeeAndProcessingAmount', () => {
    it('should correctly calculate stripe fee and processing amount for sender', async () => {
      expect(
        await Calculation.getStripeFeeAndProcessingAmount({
          amountUnit: 10000,
          feesPayer: TransactionRole.SENDER,
        }),
      ).to.deep.equal({
        processingAmountUnit: 10330,
        stripeFeeUnit: 330,
      });
      expect(mathRoundSpy).to.called;
      expect(remoteConfigStub).to.called;
    });

    it('should correctly calculate stripe fee and processing amount for receiver', async () => {
      expect(
        await Calculation.getStripeFeeAndProcessingAmount({
          amountUnit: 10000,
          feesPayer: TransactionRole.RECEIVER,
        }),
      ).to.deep.equal({
        processingAmountUnit: 9680,
        stripeFeeUnit: 320,
      });
      expect(remoteConfigStub).to.called;
    });
  });

  describe('getPaymentIntentTax', () => {
    const mockParams = {
      processingTransactionAmountUnit: 11000,
      paymentMethodId: 'pm-1',
      feesPayer: TransactionRole.SENDER,
      entityId: 'e-1',
    };

    const mockTax = {
      taxId: 'tax-1',
    };

    it('should calculate tax and fee correctly when fees are covered by sender', async () => {
      const computePaymentIntentTaxStub = sinon.stub().resolves(mockTax);
      const result = await Calculation.getPaymentIntentTax.call(
        { computePaymentIntentTax: computePaymentIntentTaxStub },
        {} as StripeSdk,
        mockParams,
      );

      const [[, input]] = computePaymentIntentTaxStub.args;

      expect(result).to.deep.equal({
        tax: mockTax,
        createTaxTransactionFeeUnit: configMock.taxes.stableUnit,
        autoCalculateFeeUnit: configMock.taxes.autoCalculateFeeUnit,
      });
      expect(computePaymentIntentTaxStub).to.calledOnce;
      expect(input).to.deep.equal({
        entityId: mockParams.entityId,
        paymentMethodId: mockParams.paymentMethodId,
        amountUnit: mockParams.processingTransactionAmountUnit + configMock.taxes.stableUnit,
      });
    });

    it('should calculate tax and fee correctly when fees are covered by receiver', async () => {
      const computePaymentIntentTaxStub = sinon.stub().resolves(mockTax);
      const result = await Calculation.getPaymentIntentTax.call(
        { computePaymentIntentTax: computePaymentIntentTaxStub },
        {} as StripeSdk,
        { ...mockParams, feesPayer: TransactionRole.RECEIVER },
      );

      const [[, input]] = computePaymentIntentTaxStub.args;

      expect(result).to.deep.equal({
        tax: mockTax,
        createTaxTransactionFeeUnit: configMock.taxes.stableUnit,
        autoCalculateFeeUnit: configMock.taxes.autoCalculateFeeUnit,
      });
      expect(computePaymentIntentTaxStub).to.calledOnce;
      expect(input).to.deep.equal({
        entityId: mockParams.entityId,
        paymentMethodId: mockParams.paymentMethodId,
        amountUnit: mockParams.processingTransactionAmountUnit,
      });
    });
  });

  describe('computePaymentIntentTax', () => {
    const currentDate = new Date();

    /* eslint-disable camelcase */
    const getSdk = ({
      date,
      taxabilityReason = 'collecting',
      billing = { billing_details: { address: { country: 'US', postal_code: '99301' } } },
      tax = {
        id: 'tax-id',
        expires_at: date,
        tax_date: date,
        tax_breakdown: [
          { taxability_reason: taxabilityReason, tax_rate_details: { percentage_decimal: 8.1 } },
        ],
        line_items: {
          data: [{ amount_tax: 810 }],
        },
      } as unknown as StripeSdk.Tax.Calculation,
    }: {
      date: Date;
      taxabilityReason?: 'collecting' | 'not_collecting';
      billing?: Record<string, unknown>;
      tax?: StripeSdk.Tax.Calculation;
    }) =>
      ({
        paymentMethods: {
          retrieve() {
            return billing;
          },
        },
        tax: {
          calculations: {
            create() {
              return tax;
            },
          },
        },
      }) as unknown as StripeSdk;
    /* eslint-enable camelcase */

    const mockParams = {
      amountUnit: 12000,
      paymentMethodId: 'pm-1',
      behaviour: TaxBehaviour.EXCLUSIVE,
      shouldIgnoreNotCollecting: false,
    };

    it('should correctly calculate payment intent tax', async () => {
      expect(
        await Calculation['computePaymentIntentTax'].call(
          {},
          getSdk({ date: currentDate }),
          mockParams,
        ),
      ).to.deep.equal({
        id: 'tax-id',
        totalAmountUnit: 810,
        behaviour: TaxBehaviour.EXCLUSIVE,
        transactionAmountWithTaxUnit: undefined,
        createdAt: currentDate,
        expiresAt: currentDate,
        totalTaxPercent: 8.1,
      });
    });

    it('should throw error: tax not collecting', async () => {
      expect(
        await waitResult(
          Calculation['computePaymentIntentTax'].call(
            {},
            getSdk({ date: currentDate, taxabilityReason: 'not_collecting' }),
            mockParams,
          ),
        ),
      ).to.throw('Failed to compute tax. One or more tax breakdown is not collecting.');
    });

    it('should throw error: billing is invalid', async () => {
      expect(
        await waitResult(
          // @ts-ignore
          Calculation['computePaymentIntentTax'].call({}, getSdk({ billing: {} }), mockParams),
        ),
      ).to.throw(
        'For tax calculation, a payment method must include, at a minimum, the postal code and country information.',
      );
    });

    it('should throw error: tax is invalid', async () => {
      expect(
        await waitResult(
          Calculation['computePaymentIntentTax'].call(
            {},
            // @ts-ignore
            getSdk({ tax: {} }),
            mockParams,
          ),
        ),
      ).to.throw('Failed to compute tax. Tax is invalid.');
    });
  });
});

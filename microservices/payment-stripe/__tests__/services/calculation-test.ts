import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import type StripeSdk from 'stripe';
import { configMock } from '@__mocks__/config';
import * as remoteConfig from '@config/remote';
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

      expect(result).to.deep.equal({ tax: mockTax, feeUnit: configMock.taxes.stableUnit });
      expect(computePaymentIntentTaxStub).to.calledOnce;
      expect(input).to.deep.equal({
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

      expect(result).to.deep.equal({ tax: mockTax, feeUnit: configMock.taxes.stableUnit });
      expect(computePaymentIntentTaxStub).to.calledOnce;
      expect(input).to.deep.equal({
        paymentMethodId: mockParams.paymentMethodId,
        amountUnit: mockParams.processingTransactionAmountUnit,
      });
    });
  });
});

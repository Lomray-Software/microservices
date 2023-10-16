import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import * as remoteConfig from '@config/remote';
import TransactionRole from '@constants/transaction-role';
import Calculation from '@services/calculation';

describe('services/calculation', () => {
  const sandbox = sinon.createSandbox();

  const remoteConfigStub = sinon.stub().resolves({
    fees: {
      paymentPercent: 2.9,
      stableUnit: 30,
    },
  });

  sinon.replace(remoteConfig, 'default', remoteConfigStub);

  beforeEach(() => {
    TypeormMock.entityManager.restore();
  });

  afterEach(() => {
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
});

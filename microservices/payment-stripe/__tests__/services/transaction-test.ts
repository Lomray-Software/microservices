import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import ChargeRefundStatus from '@constants/charge-refund-status';
import Transaction from '@services/transaction';

describe('services/transaction', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.entityManager.restore();
  });

  afterEach(() => {
    sinon.restore();
    sandbox.restore();
  });

  describe('getChargeRefundStatus', () => {
    it('should return full refund status', () => {
      expect(Transaction['getChargeRefundStatus'](100, 100)).to.equal(
        ChargeRefundStatus.FULL_REFUND,
      );
    });

    it('should return partial refund status', () => {
      expect(Transaction['getChargeRefundStatus'](100, 50)).to.equal(
        ChargeRefundStatus.PARTIAL_REFUND,
      );
    });

    it('should return no refund status', () => {
      expect(Transaction['getChargeRefundStatus'](100, 0)).to.equal(ChargeRefundStatus.NO_REFUND);
    });
  });
});

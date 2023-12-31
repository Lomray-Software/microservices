import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import StripeSdk from 'stripe';
import buildWebhookEvent from '@__helpers__/build-webhook-event';
import { bankAccountMock } from '@__mocks__/bank-account';
import { bankAccountEventMock } from '@__mocks__/webhook-events/external-account/bank-account';
import ExternalAccountWebhookHandler from '@services/webhook-handlers/external-account';

describe('services/webhook-handlers/external-account', () => {
  const sandbox = sinon.createSandbox();
  const service = new ExternalAccountWebhookHandler(TypeormMock.entityManager);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Event: account.external_account.deleted', () => {
    it('should correctly remove bank account', async () => {
      const event = buildWebhookEvent<StripeSdk.BankAccount>(bankAccountEventMock);

      const extractIdStub = sinon.stub().returns(event.data.object.id);
      const isExternalAccountIsBankAccountStub = sinon.stub().resolves(true);
      const getBankAccountByIdStub = sinon.stub().resolves(bankAccountMock);

      await service.handleExternalAccountDeleted.call(
        {
          extractId: extractIdStub,
          isExternalAccountIsBankAccount: isExternalAccountIsBankAccountStub,
          getBankAccountById: getBankAccountByIdStub,
          bankAccountRepository: TypeormMock.entityManager,
          manager: TypeormMock.entityManager,
        },
        event,
      );

      expect(TypeormMock.entityManager.remove).calledOnce;
    });

    it('should throw error: invalid bank connected account', async () => {
      const event = buildWebhookEvent<StripeSdk.BankAccount>(bankAccountEventMock);

      delete event.data.object.account;

      expect(
        await waitResult(service.handleExternalAccountDeleted(event as unknown as StripeSdk.Event)),
      ).to.throw("The connected account reference in external account data isn't found.");
    });
  });
});

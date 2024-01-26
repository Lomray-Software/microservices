import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import { cardMock } from '@__mocks__/card';
import CardRepository from '@repositories/card';
import Card from '@services/card';
import Stripe from '@services/payment-gateway/stripe';

describe('services/card', () => {
  const sandbox = sinon.createSandbox();
  let cardHandleAfterInsert: sinon.SinonSpy;
  let microserviceEventPublish: sinon.SinonSpy;

  beforeEach(() => {
    cardHandleAfterInsert = sandbox.spy(Card, 'handleAfterInsert');
    microserviceEventPublish = sandbox.spy(Microservice, 'eventPublish');
    TypeormMock.entityManager.restore();
  });

  afterEach(() => {
    sinon.restore();
    sandbox.restore();
  });

  describe('handleAfterInsert', () => {
    it('should just send event publish: card is not payment method', async () => {
      const extractPaymentMethodIdStub = sandbox
        .stub(CardRepository, 'extractPaymentMethodId')
        .returns(null);

      await cardHandleAfterInsert(cardMock, TypeormMock.entityManager);

      expect(extractPaymentMethodIdStub).to.calledOnce;
      expect(TypeormMock.entityManager.getCustomRepository).to.not.called;
      expect(microserviceEventPublish).to.called;
    });

    it('should just send event publish: default card already exist', async () => {
      const extractPaymentMethodIdStub = sandbox
        .stub(CardRepository, 'extractPaymentMethodId')
        .returns('id');

      TypeormMock.queryBuilder.getCount.resolves(1);
      await cardHandleAfterInsert(cardMock, TypeormMock.entityManager);

      expect(extractPaymentMethodIdStub).to.calledOnce;
      expect(TypeormMock.queryBuilder.getCount).to.called;
      expect(TypeormMock.entityManager.findOne).to.not.called;
      expect(microserviceEventPublish).to.called;
    });

    it('should set new card as default: default card not exist', async () => {
      const extractPaymentMethodIdStub = sandbox
        .stub(CardRepository, 'extractPaymentMethodId')
        .returns('id');
      const setDefaultCustomerPaymentMethodStub = sandbox.stub().resolves(true);
      const stripeInit = sandbox
        .stub(Stripe, 'init')
        // @ts-ignore
        .resolves({ setDefaultCustomerPaymentMethod: setDefaultCustomerPaymentMethodStub });

      TypeormMock.queryBuilder.getCount.resolves(0);

      await cardHandleAfterInsert(cardMock, TypeormMock.entityManager);

      expect(extractPaymentMethodIdStub).to.calledOnce;
      expect(stripeInit).to.calledOnce;
      expect(TypeormMock.queryBuilder.getCount).to.called;
      expect(TypeormMock.entityManager.findOne).to.calledOnce;
      expect(TypeormMock.entityManager.save).to.calledOnce;
      expect(microserviceEventPublish).to.called;
    });
  });
});

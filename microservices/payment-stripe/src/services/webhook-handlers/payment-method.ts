import { BaseException, Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import toExpirationDate from '@helpers/formatters/to-expiration-date';
import messages from '@helpers/validators/messages';
import CardRepository from '@repositories/card';

/**
 * Payment method webhook handlers
 */
class PaymentMethod {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly cardRepository: CardRepository;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.cardRepository = manager.getCustomRepository(CardRepository);
  }

  /**
   * Handles payment method update
   * @description Expected card that can be setup via setupIntent
   */
  public async handlePaymentMethodUpdated(event: StripeSdk.Event): Promise<void> {
    const {
      id,
      card: cardPaymentMethod,
      billing_details: billing,
    } = event.data.object as StripeSdk.PaymentMethod;

    if (!cardPaymentMethod) {
      throw new BaseException({
        status: 500,
        message: "Payment method card wasn't provided",
      });
    }

    const card = await this.cardRepository
      .createQueryBuilder('card')
      .where(`card.params->>'paymentMethodId' = :value OR card."paymentMethodId" = :value`, {
        value: id,
      })
      .getOne();

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Payment method'),
      });
    }

    const {
      exp_month: expMonth,
      exp_year: expYear,
      last4: lastDigits,
      brand,
      funding,
      issuer,
      country,
    } = cardPaymentMethod;

    const expired = toExpirationDate(expMonth, expYear);

    card.lastDigits = lastDigits;
    card.expired = expired;
    card.brand = brand;
    card.funding = funding;
    card.origin = country;
    // If billing was updated to null - SHOULD set null
    card.country = billing.address?.country || null;
    card.postalCode = billing.address?.postal_code || null;
    card.params.issuer = issuer;

    await this.cardRepository.save(card);

    void Microservice.eventPublish(Event.PaymentMethodUpdated, {
      funding,
      brand,
      expired,
      lastDigits,
      cardId: card.id,
    });
  }

  /**
   * Handles payment method detach
   * @description Card and other payment methods should be removed in according subscribers
   * @TODO: Handle other payment methods if needed
   */
  public async handlePaymentMethodDetached(event: StripeSdk.Event): Promise<void> {
    const { id: paymentMethodId, card: cardPaymentMethod } = event.data
      .object as StripeSdk.PaymentMethod;

    if (!cardPaymentMethod) {
      throw new BaseException({
        status: 500,
        message: "Payment method card wasn't provided",
      });
    }

    const card = await this.cardRepository
      .createQueryBuilder('card')
      .where(`card.params->>'paymentMethodId' = :value OR card."paymentMethodId" = :value`, {
        value: paymentMethodId,
      })
      .getOne();

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Payment method'),
      });
    }

    await this.cardRepository.remove(card, { data: { isFromWebhook: true } });

    void Microservice.eventPublish(Event.PaymentMethodRemoved, {
      paymentMethodId,
    });
  }
}

export default PaymentMethod;

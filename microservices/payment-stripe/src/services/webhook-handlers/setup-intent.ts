import { BaseException, Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import _ from 'lodash';
import StripeSdk from 'stripe';
import { EntityManager, Repository } from 'typeorm';
import remoteConfig from '@config/remote';
import StripePaymentMethods from '@constants/stripe-payment-methods';
import Card from '@entities/card';
import CustomerEntity from '@entities/customer';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import fromExpirationDate from '@helpers/formatters/from-expiration-date';
import toExpirationDate from '@helpers/formatters/to-expiration-date';
import messages from '@helpers/validators/messages';
import CardRepository, { ICardDataByFingerprintResult } from '@repositories/card';

/**
 * Setup intent Webhook Handler
 */
class SetupIntent {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly cardRepository: CardRepository;

  /**
   * @private
   */
  private readonly customerRepository: Repository<CustomerEntity>;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.cardRepository = manager.getCustomRepository(CardRepository);
    this.customerRepository = manager.getRepository(CustomerEntity);
  }

  /**
   * Handles setup intent succeed
   * @description Support cards. Should be called when webhook triggers
   */
  public async handleSetupIntentSucceed(event: StripeSdk.Event, sdk: StripeSdk): Promise<void> {
    const { duplicatedCardsUsage } = await remoteConfig();

    /* eslint-disable camelcase */
    const { id, payment_method } = event.data.object as StripeSdk.SetupIntent;

    if (!payment_method) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('The SetupIntent payment method'),
      });
    }

    /**
     * Get payment method data
     */
    const paymentMethod = await sdk.paymentMethods.retrieve(
      extractIdFromStripeInstance(payment_method),
      {
        expand: [StripePaymentMethods.CARD],
      },
    );

    if (!paymentMethod?.card || !paymentMethod?.customer) {
      throw new BaseException({
        status: 500,
        message: 'The payment method card or customer data is invalid.',
      });
    }

    const customer = await this.customerRepository.findOne({
      customerId: extractIdFromStripeInstance(paymentMethod.customer),
    });

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    const {
      id: paymentMethodId,
      billing_details: billing,
      card: {
        brand,
        last4: lastDigits,
        exp_month: expMonth,
        exp_year: expYear,
        funding,
        country,
        issuer,
        fingerprint,
      },
    } = paymentMethod;

    const { userId } = customer;

    const cardParams = {
      lastDigits,
      brand,
      userId,
      funding,
      fingerprint,
      paymentMethodId,
      origin: country,
      ...(billing.address?.country ? { country: billing.address.country } : {}),
      ...(billing.address?.postal_code ? { postalCode: billing.address.postal_code } : {}),
      expired: toExpirationDate(expMonth, expYear),
    };

    const cardEntity = this.cardRepository.create({
      ...cardParams,
      params: {
        isApproved: true,
        setupIntentId: id,
        issuer,
      },
    });

    /**
     * If we should reject duplicated cards - check
     */
    if (duplicatedCardsUsage === 'reject') {
      const cardData = await CardRepository.getCardDataByFingerprint({
        userId,
        fingerprint,
        shouldExpandCard: true,
      });

      /**
       * Cancel set up card if this card already exist as the payment method
       */
      if (cardData.isExist && cardData.type === 'paymentMethod') {
        await this.detachOrRenewWithDetachDuplicatedCard(
          paymentMethodId,
          cardEntity,
          cardData,
          sdk,
        );

        return;
      }
    }

    const savedCard = await this.cardRepository.save(cardEntity);

    void Microservice.eventPublish(Event.SetupIntentSucceeded, savedCard);
  }

  /**
   * Detach duplicated card
   * @description Will detach duplicated card from Stripe customer
   */
  private async detachOrRenewWithDetachDuplicatedCard(
    paymentMethodId: string,
    cardEntity: Card,
    { entity }: ICardDataByFingerprintResult,
    sdk: StripeSdk,
  ): Promise<void> {
    if (!entity) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Failed to validate duplicated card. Card'),
      });
    }

    /**
     * Card properties for renewal card that must be identical
     */
    const cardProperties = ['lastDigits', 'brand', 'origin', 'fingerprint', 'funding', 'userId'];
    const existingCardPaymentMethodId = CardRepository.extractPaymentMethodId(entity);

    const { year: existingYear, month: existingMonth } = fromExpirationDate(entity.expired);
    const { year: updatedYear, month: updatedMonth } = fromExpirationDate(cardEntity.expired);

    /**
     * Update renewal card details
     * @description Stripe does not create new fingerprint if card was renewal with new expiration date
     */
    if (
      entity.expired !== cardEntity.expired &&
      // All other card details MUST be equal
      _.isEqual(_.pick(entity, cardProperties), _.pick(cardEntity, cardProperties)) &&
      // Check expiration dates
      updatedYear >= existingYear &&
      updatedMonth >= existingMonth
    ) {
      entity.expired = cardEntity.expired;

      /**
       * Update card details and next() detach new duplicated card
       */
      await sdk.paymentMethods.update(existingCardPaymentMethodId as string, {
        card: {
          exp_month: updatedMonth,
          exp_year: updatedYear,
        },
      });

      await this.cardRepository.save(entity);
    }

    /**
     * If customer trying to add identical, not renewal card
     * @description Detach duplicated card from Stripe customer
     */
    await sdk.paymentMethods.detach(paymentMethodId);

    await Microservice.eventPublish(Event.CardNotCreatedDuplicated, cardEntity);
  }
}

export default SetupIntent;

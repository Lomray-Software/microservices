import { BaseException, Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { EntityManager, getManager } from 'typeorm';
import CardEntity from '@entities/card';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';
import CardRepository from '@repositories/card';
import Factory from '@services/payment-gateway/factory';

/**
 * Card service
 * @TODO: Add support if needed when card will be used as the external account in the connect account
 * NOTE: Card handling as the payment method
 */
class Card {
  /**
   * Handle create
   * @description NOTES:
   * 1. Card should be created from setup intent succeed
   * 2. Should be called after insert
   */
  public static async handleCreate(entity: CardEntity, manager: EntityManager): Promise<void> {
    const paymentMethodId = CardRepository.extractPaymentMethodId(entity);

    if (!paymentMethodId) {
      void Microservice.eventPublish(Event.CardCreated, entity);

      return;
    }

    const cardRepository = manager.getRepository(CardEntity);
    const customerRepository = manager.getRepository(CustomerEntity);
    const service = await Factory.create(getManager());

    /**
     * Get attached cards count as the payment method
     */
    const cardsCount = await cardRepository
      .createQueryBuilder('card')
      .where('card.userId = :userId', { userId: entity.userId })
      .andWhere(
        `card.params ->> 'paymentMethodId' IS NOT NULL OR card."paymentMethodId" IS NOT NULL`,
      )
      .andWhere('card.isDefault = :isDefault', { isDefault: true })
      .getCount();

    /**
     * Card count will contain current card
     */
    if (cardsCount) {
      void Microservice.eventPublish(Event.CardCreated, entity);

      return;
    }

    /**
     * If 0 cards with the required params for payment method
     */
    const customer = await customerRepository.findOne({ userId: entity.userId });

    if (!customer) {
      throw new BaseException({ status: 500, message: messages.getNotFoundMessage('Customer') });
    }

    const isSet = await service.setDefaultCustomerPaymentMethod(
      customer.customerId,
      paymentMethodId,
    );

    if (!isSet) {
      throw new BaseException({
        status: 500,
        message: 'Failed to set card as the default payment method for customer',
      });
    }

    entity.isDefault = true;
    await cardRepository.save(entity, { listeners: false });

    void Microservice.eventPublish(Event.CardCreated, entity);
  }

  /**
   * Handle update stripe card and card entities default payment method status
   * @TODO: Add support if needed for updating card data in the stripe
   */
  public static async handleUpdate(
    databaseEntity: CardEntity,
    entity: CardEntity,
    manager: EntityManager,
  ): Promise<void> {
    const paymentMethodId = CardRepository.extractPaymentMethodId(entity);

    /**
     * If card isn't payment method
     */
    if (!paymentMethodId || databaseEntity.isDefault === entity.isDefault) {
      return;
    }

    if (!entity.isDefault) {
      throw new BaseException({ status: 500, message: "Card can't be set manually to default" });
    }

    const cardRepository = manager.getRepository(CardEntity);
    const customerRepository = manager.getRepository(CustomerEntity);
    const service = await Factory.create(getManager());

    const { userId } = entity;

    /**
     * Get all customer related card
     */
    const cards = await cardRepository.find({
      userId,
    });

    if (!cards.length) {
      throw new BaseException({ status: 500, message: "Cards aren't found" });
    }

    const customer = await customerRepository.findOne({ userId });

    if (!customer) {
      throw new BaseException({ status: 500, message: messages.getNotFoundMessage('Customer') });
    }

    const isSet = await service.setDefaultCustomerPaymentMethod(
      customer.customerId,
      paymentMethodId,
    );

    if (!isSet) {
      throw new BaseException({
        status: 500,
        message: 'Failed to set card as the default payment method for customer',
      });
    }

    /**
     * Update cards default statuses on change default card for charge
     */
    await Promise.all(
      cards.map((card) => {
        card.isDefault = CardRepository.extractPaymentMethodId(card) === paymentMethodId;

        return cardRepository.save(card, { listeners: false });
      }),
    );

    /**
     * Check if customer has default payment method
     */
    if (customer.params.hasDefaultPaymentMethod && paymentMethodId) {
      return;
    }

    customer.params.hasDefaultPaymentMethod = Boolean(paymentMethodId);

    await customerRepository.save(customer);

    void Microservice.eventPublish(Event.CardUpdated, entity);
  }

  /**
   * Handle remove card if it's payment method
   */
  public static async handleRemove(
    databaseEntity: CardEntity,
    manager: EntityManager,
  ): Promise<void> {
    const cardRepository = manager.getRepository(CardEntity);
    const service = await Factory.create(getManager());

    const paymentMethodId = CardRepository.extractPaymentMethodId(databaseEntity);

    /**
     * Card isn't payment method
     */
    if (!paymentMethodId) {
      return;
    }

    const { userId } = databaseEntity;

    const card = await cardRepository
      .createQueryBuilder('card')
      .where('card.userId = :userId', { userId })
      .andWhere(
        `card.params ->> 'paymentMethodId' = :paymentMethodId OR card."paymentMethodId" = :paymentMethodId`,
        { paymentMethodId },
      )
      .getOne();

    if (!card) {
      throw new BaseException({ status: 500, message: messages.getNotFoundMessage('Card') });
    }

    if (card.isDefault) {
      throw new BaseException({ status: 400, message: "Default card can't be removed." });
    }

    const isRemoved = await service.removeCustomerPaymentMethod(paymentMethodId);

    if (!isRemoved) {
      throw new BaseException({
        status: 500,
        message: 'Failed to remove card as the payment method.',
      });
    }

    await cardRepository.remove(card, { listeners: false });

    void Microservice.eventPublish(Event.CardRemoved, databaseEntity);
  }
}

export default Card;

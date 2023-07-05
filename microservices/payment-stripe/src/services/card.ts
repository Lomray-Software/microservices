import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager, getManager } from 'typeorm';
import CardEntity from '@entities/card';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';
import Factory from '@services/payment-gateway/factory';

/**
 * Card service
 * @TODO: Add support if needed when card will be used as the external account in the connect account
 * NOTE: Card handling as the payment method
 */
class Card {
  /**
   * Handle create
   * NOTES:
   * 1. Card should be created from setup intent succeed
   * 2. Should be called after insert
   */
  public static async handleCreate(entity: CardEntity, manager: EntityManager): Promise<void> {
    if (!entity.params.paymentMethodId) {
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
      .andWhere("card.params ->> 'paymentMethodId' IS NOT NULL")
      .andWhere('card.isDefault = :isDefault', { isDefault: true })
      .getCount();

    /**
     * Card count will contain current card
     */
    if (cardsCount) {
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
      entity.params.paymentMethodId,
    );

    if (!isSet) {
      throw new BaseException({
        status: 500,
        message: 'Failed to set card as the default payment method for customer',
      });
    }

    entity.isDefault = true;
    await cardRepository.save(entity, { listeners: false });
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
    /**
     * If card isn't payment method
     */
    if (!entity.params.paymentMethodId || databaseEntity.isDefault === entity.isDefault) {
      return;
    }

    if (!entity.isDefault) {
      throw new BaseException({ status: 500, message: "Card can't be set manually to default" });
    }

    const cardRepository = manager.getRepository(CardEntity);
    const customerRepository = manager.getRepository(CustomerEntity);
    const service = await Factory.create(getManager());

    const {
      params: { paymentMethodId },
      userId,
    } = entity;

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
        card.isDefault = card.params.paymentMethodId === paymentMethodId;

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

    /**
     * Card isn't payment method
     */
    if (!databaseEntity.params.paymentMethodId) {
      return;
    }

    const {
      params: { paymentMethodId },
      userId,
    } = databaseEntity;

    const card = await cardRepository
      .createQueryBuilder('card')
      .where('card.userId = :userId', { userId })
      .andWhere("card.params ->> 'paymentMethodId' = :paymentMethodId", { paymentMethodId })
      .getOne();

    if (!card) {
      throw new BaseException({ status: 500, message: messages.getNotFoundMessage('Card') });
    }

    const isRemoved = await service.removeCustomerPaymentMethod(paymentMethodId);

    if (!isRemoved) {
      throw new BaseException({
        status: 500,
        message: 'Failed to remove card as the payment method.',
      });
    }

    await cardRepository.remove(card, { listeners: false });
  }
}

export default Card;

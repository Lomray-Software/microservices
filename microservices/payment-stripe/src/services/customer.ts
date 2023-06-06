import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager } from 'typeorm';
import CardEntity from '@entities/card';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';

/**
 * Customer service
 */
class Customer {
  /**
   * Handles payment method (card) update, that allowed customer to be charged
   * NOTES: Card should be default in stripe and db, also should have payment method id
   */
  public static async handlePaymentMethod(card: CardEntity, manager: EntityManager): Promise<void> {
    const customerRepository = manager.getRepository(CustomerEntity);

    const customer = await customerRepository.findOne({ userId: card.userId });

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Related card customer'),
      });
    }

    customer.params.isHaveDefaultPaymentMethod = Boolean(
      card.isDefault && card.params?.paymentMethodId,
    );

    await customerRepository.save(customer, { listeners: false });
  }
}

export default Customer;

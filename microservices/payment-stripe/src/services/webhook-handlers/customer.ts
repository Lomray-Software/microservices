import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';
import CardRepository from '@repositories/card';

/**
 * Customer webhook handlers
 */
class Customer {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

  /**
   * Handles customer update
   */
  public async handleCustomerUpdated(
    event: StripeSdk.Event,
    manager: EntityManager, // Required if manger is transaction manager
  ): Promise<void> {
    await manager.transaction(async (entityManager) => {
      const customerRepository = entityManager.getRepository(CustomerEntity);
      const cardRepository = entityManager.getCustomRepository(CardRepository);
      const { id, invoice_settings: invoiceSettings } = event.data.object as StripeSdk.Customer;

      /**
       * @TODO: Investigate why relations return empty array
       */
      const customer = await customerRepository.findOne({ customerId: id });

      if (!customer) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Customer'),
        });
      }

      const cards = await cardRepository.find({
        userId: customer.userId,
      });

      /**
       * Update cards default statuses on change default card for charge
       */

      await Promise.all(
        cards.map((card) => {
          card.isDefault =
            CardRepository.extractPaymentMethodId(card) === invoiceSettings.default_payment_method;

          return cardRepository.save(card);
        }),
      );

      /**
       * If customer has default payment method, and it's exist in stripe
       */
      if (customer.params.hasDefaultPaymentMethod && invoiceSettings.default_payment_method) {
        return;
      }

      customer.params.hasDefaultPaymentMethod = Boolean(invoiceSettings.default_payment_method);

      await customerRepository.save(customer);
    });
  }
}

export default Customer;

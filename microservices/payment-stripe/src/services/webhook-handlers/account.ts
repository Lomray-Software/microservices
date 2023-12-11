import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import messages from '@helpers/validators/messages';
import CustomerRepository from '@repositories/customer';

/**
 * Account webhook handlers
 */
class Account {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly customerRepository: CustomerRepository;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.customerRepository = manager.getCustomRepository(CustomerRepository);
  }

  /**
   * Handles customer update
   * @description Connect account event
   */
  public async handleAccountUpdated(event: StripeSdk.Event) {
    /* eslint-disable camelcase */
    const {
      id,
      payouts_enabled: isPayoutEnabled,
      charges_enabled: isChargesEnabled,
      capabilities,
      business_profile,
    } = event.data.object as StripeSdk.Account;

    const customer = await CustomerRepository.getCustomerByAccountId(id, this.manager);

    if (!customer) {
      throw new BaseException({
        status: 404,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    /**
     * Check if customer can accept payment
     * @description Check if user correctly and verify setup connect account
     */
    customer.params.isPayoutEnabled = isPayoutEnabled;
    customer.params.transferCapabilityStatus = capabilities?.transfers || 'inactive';
    customer.params.isVerified = isChargesEnabled && capabilities?.transfers === 'active';
    customer.params.accountSupportPhoneNumber = business_profile?.support_phone;

    await this.customerRepository.save(customer);
    /* eslint-enable camelcase */
  }
}

export default Account;

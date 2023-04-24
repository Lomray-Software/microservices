import StripeSdk from 'stripe';
import { Repository } from 'typeorm';
import Customer, { ICustomerParams } from '@entities/customer';
import IStripeOptions from '@interfaces/stripe-options';

export interface IConnectAccountOutput {
  object: string;
  created: number;
  expires_at: number;
  url: string;
}

class ConnectAccount {
  /**
   * @protected
   */
  protected readonly paymentEntity: StripeSdk;

  /**
   * @protected
   */
  protected readonly paymentOptions: IStripeOptions;

  /**
   * @constructor
   */
  constructor(paymentOptions: IStripeOptions) {
    this.paymentEntity = new StripeSdk(paymentOptions.apiKey, paymentOptions.config);
  }

  /**
   * @protected
   */

  protected readonly customerRepository: Repository<Customer>;

  /**
   * Get connect account
   * WHAT WE CAN RETURN IF connectAccount not exist?
   */

  protected async getConnectedAccount(userId: string) {
    const connectAccount = await this.customerRepository.findOne(userId);

    if (connectAccount && !connectAccount.params.accountId) {
      return connectAccount;
    }

    return null;
  }

  /**
   * Create new connect account entity
   */
  public async createCustomerWithConnect(userId: string, params: ICustomerParams) {
    const connectAccount = this.customerRepository.create({
      params,
      userId,
    });

    await this.customerRepository.save(connectAccount);

    return connectAccount;
  }

  /**
   * Create ConnectAccount make redirect to account link and save stripeConnectAccount in customer
   */
  public async createConnectAccountWithLink(
    userId: string,
    email: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<IConnectAccountOutput> {
    const stripeConnectAccount: StripeSdk.Account = await this.paymentEntity.accounts.create({
      type: 'standard',
      country: 'US',
      email,
    });

    const stripeConnectAccountLink: StripeSdk.AccountLink =
      await this.paymentEntity.accountLinks.create({
        account: stripeConnectAccount.id,
        type: 'account_onboarding',
        // eslint-disable-next-line camelcase
        refresh_url: refreshUrl,
        // eslint-disable-next-line camelcase
        return_url: returnUrl,
      });

    await this.createCustomerWithConnect(userId, { accountId: stripeConnectAccount.id });

    return stripeConnectAccountLink;
  }
}

export default ConnectAccount;

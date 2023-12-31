import { Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import toExpirationDate from '@helpers/formatters/to-expiration-date';
import isAllowedInstantPayout from '@helpers/is-allowed-instant-payout';
import isExternalAccountIsBankAccount from '@helpers/is-external-account-is-bank-account';
import messages from '@helpers/validators/messages';
import BankAccountRepository from '@repositories/bank-account';
import CardRepository from '@repositories/card';
import CustomerRepository from '@repositories/customer';

/**
 * External account webhook handlers
 */
class ExternalAccount {
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
  private readonly bankAccountRepository: BankAccountRepository;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.cardRepository = manager.getCustomRepository(CardRepository);
    this.bankAccountRepository = manager.getCustomRepository(BankAccountRepository);
  }

  /**
   * Handles connect account create
   * @description NOTES: Connect account event
   */
  public async handleExternalAccountCreated(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'The connected account reference in external account data',
        ),
      });
    }

    const { userId, params } = await CustomerRepository.getCustomerByAccountId(
      extractIdFromStripeInstance(externalAccount.account),
      this.manager,
    );

    if (!isExternalAccountIsBankAccount(externalAccount)) {
      const {
        id: cardId,
        last4: lastDigits,
        brand,
        funding,
        exp_year,
        exp_month,
        available_payout_methods: availablePayoutMethods,
        default_for_currency: isDefault,
        address_zip: billingPostalCode,
        address_country: billingCountry,
        fingerprint,
        issuer,
        country,
      } = externalAccount;

      /**
       * Only connected custom account can attach few external account for payouts
       */
      if (params.accountType === 'custom') {
        // User SHOULD NOT be eligible in any way to attach same card as payout method
        const { isExist, type } = await CardRepository.getCardDataByFingerprint({
          userId,
          fingerprint,
        });

        if (isExist && type === 'externalAccount') {
          /**
           * @TODO: Handle for custom account duplicated card attach. Throw error and delete card from Stripe, etc..
           */
          const message = 'External account attached card is duplicated.';

          Log.error(message);
        }
      }

      await this.cardRepository.save({
        lastDigits,
        brand,
        funding,
        userId,
        origin: country,
        ...(fingerprint ? { fingerprint } : {}),
        isInstantPayoutAllowed: isAllowedInstantPayout(availablePayoutMethods),
        ...(billingCountry ? { country: billingCountry } : {}),
        ...(billingPostalCode ? { postalCode: billingPostalCode } : {}),
        isDefault: Boolean(isDefault),
        expired: toExpirationDate(exp_month, exp_year),
        params: { cardId, issuer },
      });

      return;
    }

    const {
      id: bankAccountId,
      last4: lastDigits,
      account_holder_name: holderName,
      bank_name: bankName,
      default_for_currency: isDefault,
      available_payout_methods: availablePayoutMethods,
    } = externalAccount as StripeSdk.BankAccount;

    await this.bankAccountRepository.save({
      isDefault: Boolean(isDefault),
      bankAccountId,
      lastDigits,
      userId,
      isInstantPayoutAllowed: isAllowedInstantPayout(availablePayoutMethods),
      holderName,
      bankName,
      params: { bankAccountId },
    });
    /* eslint-enable camelcase */
  }

  /**
   * Handles connect account update
   * @description Connect account event
   */
  public async handleExternalAccountUpdated(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!isExternalAccountIsBankAccount(externalAccount)) {
      const card = await CardRepository.getCardById(externalAccount.id, this.manager);

      if (!card) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Failed to handle external account updated. Card'),
        });
      }

      const {
        last4: lastDigits,
        brand,
        exp_year,
        exp_month,
        default_for_currency: isDefault,
        available_payout_methods: availablePayoutMethods,
        funding,
        issuer,
        country,
        address_country: billingCountry,
        address_zip: billingPostalCode,
      } = externalAccount;

      card.isDefault = Boolean(isDefault);
      card.lastDigits = lastDigits;
      card.expired = toExpirationDate(exp_month, exp_year);
      card.brand = brand;
      card.funding = funding;
      card.origin = country;
      card.params.issuer = issuer;
      card.country = billingCountry;
      card.postalCode = billingPostalCode;
      card.isInstantPayoutAllowed = isAllowedInstantPayout(availablePayoutMethods);

      await this.cardRepository.save(card);

      return;
    }

    const bankAccount = await BankAccountRepository.getBankAccountById(
      externalAccount.id,
      this.manager,
    );

    if (!bankAccount) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to handle external account updated. Bank account',
        ),
      });
    }

    const {
      last4: lastDigits,
      account_holder_name: holderName,
      bank_name: bankName,
      default_for_currency: isDefault,
      available_payout_methods: availablePayoutMethods,
    } = externalAccount as StripeSdk.BankAccount;

    bankAccount.isDefault = Boolean(isDefault);
    bankAccount.lastDigits = lastDigits;
    bankAccount.holderName = holderName;
    bankAccount.bankName = bankName;
    bankAccount.isInstantPayoutAllowed = isAllowedInstantPayout(availablePayoutMethods);

    await this.bankAccountRepository.save(bankAccount);
    /* eslint-enable camelcase */
  }

  /**
   * Handles connect account deleted
   * @description Connect account event
   */
  public async handleExternalAccountDeleted(event: StripeSdk.Event): Promise<void> {
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'The connected account reference in external account data',
        ),
      });
    }

    const externalAccountId = extractIdFromStripeInstance(externalAccount.id);

    if (!isExternalAccountIsBankAccount(externalAccount)) {
      const card = await CardRepository.getCardById(externalAccountId, this.manager);

      if (!card) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Failed to handle external account deleted. Card'),
        });
      }

      await this.cardRepository.remove(card);

      return;
    }

    const bankAccount = await BankAccountRepository.getBankAccountById(
      externalAccountId,
      this.manager,
    );

    if (!bankAccount) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to handle external account deleted. Bank account',
        ),
      });
    }

    await this.bankAccountRepository.remove(bankAccount);
  }
}

export default ExternalAccount;

import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import isExternalAccountIsBankAccount from '@helpers/is-external-account-is-bank-account';
import messages from '@helpers/validators/messages';
import BankAccountRepository from '@repositories/bank-account';
import CardRepository from '@repositories/card';

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

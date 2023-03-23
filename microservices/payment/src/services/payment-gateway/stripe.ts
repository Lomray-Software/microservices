import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Abstract from './abstract';
import type { IBankAccountParams, ICardParams } from './abstract';

/**
 * Stripe payment provider
 */
class Stripe extends Abstract {
  /**
   * Add new card
   */
  addCard(params: ICardParams): Promise<Card> {
    return Promise.resolve(new Card());
  }

  /**
   * Add bank account
   */
  addBankAccount(params: IBankAccountParams): Promise<BankAccount> {
    return Promise.resolve(new BankAccount());
  }
}

export default Stripe;

import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager } from 'typeorm';
import BankAccountEntity from '@entities/bank-account';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';

/**
 * Bank account service
 */
class BankAccount {
  /**
   * Handle create
   */
  public static async handleCreate(
    entity: BankAccountEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!entity.params.bankAccountId) {
      return;
    }

    const bankAccountRepository = manager.getRepository(BankAccountEntity);
    const customerRepository = manager.getRepository(CustomerEntity);

    /**
     * Get attached bank accounts count as the payment method
     */
    const bankAccountsCount = await bankAccountRepository
      .createQueryBuilder('bankAccount')
      .where('bankAccount.userId = :userId', { userId: entity.userId })
      .andWhere("bankAccount.params ->> 'bankAccountId' IS NOT NULL")
      .andWhere('bankAccount.isDefault = :isDefault', { isDefault: true })
      .getCount();

    /**
     * Bank account count will contain current card
     */
    if (bankAccountsCount) {
      return;
    }

    /**
     * If 0 bank accounts with the required params
     */
    const customer = await customerRepository.findOne({ userId: entity.userId });

    if (!customer) {
      throw new BaseException({ status: 500, message: messages.getNotFoundMessage('Customer') });
    }

    entity.isDefault = true;
    await bankAccountRepository.save(entity, { listeners: false });
  }

  // /**
  //  * Handle update bank account
  //  */
  // public static async handleUpdate(
  //   entity: BankAccountEntity,
  //   manager: EntityManager,
  // ): Promise<void> {}
}

export default BankAccount;

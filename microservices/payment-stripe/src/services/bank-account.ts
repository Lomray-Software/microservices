import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager, getManager } from 'typeorm';
import BankAccountEntity from '@entities/bank-account';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';
import Factory from '@services/payment-gateway/factory';

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

  /**
   * Handle update bank account
   * Sets default bank account
   */
  public static async handleUpdate(
    databaseEntity: BankAccountEntity,
    entity: BankAccountEntity,
  ): Promise<void> {
    /**
     * Is bank account is the external account and if is default updated
     */
    if (!entity.params.bankAccountId || databaseEntity.isDefault === entity.isDefault) {
      return;
    }

    if (!entity.isDefault) {
      throw new BaseException({
        status: 500,
        message: "Bank account can't be set manually to default",
      });
    }

    const service = await Factory.create(getManager());

    await service.setDefaultExternalAccount(entity.params.bankAccountId);
  }
}

export default BankAccount;

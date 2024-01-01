import { EntityManager, EntityRepository, Repository } from 'typeorm';
import BankAccountEntity from '@entities/bank-account';

@EntityRepository(BankAccountEntity)
class BankAccount extends Repository<BankAccountEntity> {
  /**
   * Returns bank account by bank account id
   * @description Uses to search related connect account (external account) data
   */
  public static getBankAccountById(
    bankAccountId: string,
    manager: EntityManager,
  ): Promise<BankAccountEntity | undefined> {
    return manager
      .getRepository(BankAccountEntity)
      .createQueryBuilder('bankAccount')
      .where("bankAccount.params ->> 'bankAccountId' = :bankAccountId", { bankAccountId })
      .getOne();
  }
}

export default BankAccount;

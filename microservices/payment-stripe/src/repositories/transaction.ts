import { EntityRepository, Repository } from 'typeorm';
import TransactionEntity from '@entities/transaction';

/**
 * Transaction repository
 */
@EntityRepository(TransactionEntity)
class Transaction extends Repository<TransactionEntity> {
  /**
   * Get is entity transaction
   * @example Cast types avoid from ObjectLiteral or undefined in after update
   */
  public static getIsEntityTransaction<TEntity>(
    entity?: TransactionEntity | TEntity,
  ): entity is TransactionEntity {
    return entity instanceof TransactionEntity;
  }
}

export default Transaction;

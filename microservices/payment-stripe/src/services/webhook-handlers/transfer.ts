import { Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager, Repository } from 'typeorm';
import TransactionEntity from '@entities/transaction';
import messages from '@helpers/validators/messages';

/**
 * Transfer webhook handlers
 */
class Transfer {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly transactionRepository: Repository<TransactionEntity>;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.transactionRepository = manager.getRepository(TransactionEntity);
  }

  /**
   * Transfer reversed
   */
  public async transferReversed(event: StripeSdk.Event): Promise<void> {
    const { amount_reversed: reversedAmount, source_transaction: chargeId } = event.data
      .object as StripeSdk.Transfer;

    const transactions = await this.transactionRepository
      .createQueryBuilder('t')
      .where('t.chargeId = :chargeId', { chargeId })
      .getMany();

    if (!transactions.length) {
      const errorMessage = messages.getNotFoundMessage(
        'Failed to hande transfer reversed. Debit or credit transaction',
      );

      Log.error(errorMessage);

      throw new BaseException({
        status: 500,
        message: errorMessage,
      });
    }

    transactions.forEach((transaction) => {
      transaction.params.transferReversedAmount = reversedAmount;
    });

    await this.transactionRepository.save(transactions);
  }
}

export default Transfer;

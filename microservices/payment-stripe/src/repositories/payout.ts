import { EntityRepository, Repository } from 'typeorm';
import PayoutEntity from '@entities/payout';

/**
 * Payout repository
 */
@EntityRepository(PayoutEntity)
class Payout extends Repository<PayoutEntity> {
  /**
   * Get is entity payout
   */
  public static getIsEntityPayout<TEntity>(
    entity?: PayoutEntity | TEntity,
  ): entity is PayoutEntity {
    return entity instanceof PayoutEntity;
  }
}

export default Payout;

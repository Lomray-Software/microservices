import { EntityRepository, Repository } from 'typeorm';
import DisputeEntity from '@entities/dispute';

/**
 * Dispute repository
 */
@EntityRepository(DisputeEntity)
class Dispute extends Repository<DisputeEntity> {
  /**
   * Get is entity dispute
   * @example Cast types avoid from ObjectLiteral or undefined in after update
   */
  public static getIsEntityDispute<TEntity>(
    entity?: DisputeEntity | TEntity,
  ): entity is DisputeEntity {
    return Boolean(
      entity && 'disputeId' in entity && 'chargedAmount' in entity && 'chargedFees' in entity,
    );
  }
}

export default Dispute;

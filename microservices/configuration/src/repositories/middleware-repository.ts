import { EntityRepository, Repository } from 'typeorm';
import Middleware from '@entities/middleware';

@EntityRepository(Middleware)
class MiddlewareRepository extends Repository<Middleware> {
  /**
   * Convert objects to Middleware and bulk save
   * Avoid query builder for support mongodb
   */
  public bulkSave(rows: Partial<Middleware>[], chunkSize = 10): Promise<Middleware[]> {
    return this.save(
      rows.map((row) => this.create(row)),
      { chunk: chunkSize },
    );
  }
}

export default MiddlewareRepository;

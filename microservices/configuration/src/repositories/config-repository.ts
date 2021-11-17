import { EntityRepository, Repository } from 'typeorm';
import Config from '@entities/config';

@EntityRepository(Config)
class ConfigRepository extends Repository<Config> {
  /**
   * Convert objects to Config and bulk save
   * Avoid query builder for support mongodb
   */
  public bulkSave(rows: Partial<Config>[], chunkSize = 10): Promise<Config[]> {
    return this.save(
      rows.map((row) => this.create(row)),
      { chunk: chunkSize },
    );
  }
}

export default ConfigRepository;

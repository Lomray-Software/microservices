import { EntityRepository, Repository } from 'typeorm';
import Config from '@entities/config';
import Log from '@services/log';

@EntityRepository(Config)
class ConfigRepository extends Repository<Config> {
  /**
   * Convert objects to Config and bulk save
   * Avoid query builder for support mongodb
   */
  async bulkSave(rows: Partial<Config>[], chunkSize = 10): Promise<void> {
    try {
      await this.save(
        rows.map((row) => this.create(row)),
        { chunk: chunkSize },
      );
    } catch (e) {
      Log.error(`Insert initial configs error: ${e.message as string}`, e);
    }
  }
}

export default ConfigRepository;

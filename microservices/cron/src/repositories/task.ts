import { EntityRepository, Repository } from 'typeorm';
import TaskEntity from '@entities/task';

@EntityRepository(TaskEntity)
class Task extends Repository<TaskEntity> {
  /**
   * Convert objects to Task and bulk save
   */
  public bulkSave(rows: Partial<TaskEntity>[], chunkSize = 10): Promise<TaskEntity[]> {
    return this.save(
      rows.map((row) => this.create(row)),
      { chunk: chunkSize },
    );
  }
}

export default Task;

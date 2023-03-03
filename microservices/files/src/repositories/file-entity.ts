import { EntityRepository, Repository } from 'typeorm';
import FileEntityModel from '@entities/file-entity';

@EntityRepository(FileEntityModel)
class FileEntity extends Repository<FileEntityModel> {
  /**
   * Resort entities by entityId
   */
  public refreshOrder(entityId: string): Promise<void> {
    const { tableName } = this.metadata;

    return this.query(
      `
        UPDATE ${tableName}
        SET "order" = c.counter
        FROM
            (
                SELECT row_number() over (order by a."order", a."createdAt" DESC) AS counter, a."id" as rowId
                FROM ${tableName} a
                WHERE a."entityId" = $1
            ) AS c
        WHERE "id" = c.rowId
    `,
      [entityId],
    );
  }
}

export default FileEntity;

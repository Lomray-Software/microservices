import { MigrationInterface, QueryRunner } from 'typeorm';

export default class historyTime1689353505403 implements MigrationInterface {
  name = 'historyTime1689353505403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "history" ALTER COLUMN "executionTime" TYPE numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "history" ALTER COLUMN "executionTime" TYPE numeric(6,2)`);
  }
}

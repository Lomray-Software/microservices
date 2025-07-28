import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddCustomAmount1753535753000 implements MigrationInterface {
  name = 'AddCustomAmount1753535753000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transaction"
      ADD COLUMN "customAmount" integer DEFAULT null
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transaction"
      DROP COLUMN "customAmount"
    `);
  }
}

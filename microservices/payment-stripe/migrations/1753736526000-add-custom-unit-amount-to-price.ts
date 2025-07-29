import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddCustomUnitAmountToPrice1753736526000 implements MigrationInterface {
  name = 'AddCustomUnitAmountToPrice1753736526000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add customUnitAmount column to price table
    await queryRunner.query(`
      ALTER TABLE "price"
        ADD COLUMN "customUnitAmount" jsonb DEFAULT NULL
    `);

    // Remove customAmount column from transaction table
    await queryRunner.query(`
      ALTER TABLE "transaction"
      DROP
      COLUMN IF EXISTS "customAmount"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove customUnitAmount column from price table
    await queryRunner.query(`
      ALTER TABLE "price"
      DROP
      COLUMN "customUnitAmount"
    `);

    // Add back customAmount column to transaction table
    await queryRunner.query(`
      ALTER TABLE "transaction"
        ADD COLUMN "customAmount" integer DEFAULT NULL
    `);
  }
}

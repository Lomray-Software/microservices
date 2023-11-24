import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionTaxRefs1700750263639 implements MigrationInterface {
  name = 'transactionTaxRefs1700750263639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "taxCalculationId" character varying(66)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "taxTransactionId" character varying(66)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "taxTransactionId"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "taxCalculationId"`);
  }
}

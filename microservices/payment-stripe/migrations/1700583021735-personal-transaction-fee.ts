import { MigrationInterface, QueryRunner } from 'typeorm';

export default class personalTransactionFee1700583021735 implements MigrationInterface {
  name = 'personalTransactionFee1700583021735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "personalFee" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "personalFee"`);
  }
}

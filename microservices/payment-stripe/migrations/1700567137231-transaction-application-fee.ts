import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionApplicationFee1700567137231 implements MigrationInterface {
  name = 'transactionApplicationFee1700567137231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "applicationFeeId" character varying(66)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "params" SET DEFAULT '{"refundedTransactionAmount":0,"refundedApplicationFeeAmount":0,"platformFee":0,"stripeFee":0}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "applicationFeeId"`);
    await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "params" SET DEFAULT '{}'`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionCharge1700733245581 implements MigrationInterface {
  name = 'transactionCharge1700733245581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" ADD "chargeId" character varying(66)`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "params" SET DEFAULT '{"refundedTransactionAmount":0,"refundedApplicationFeeAmount":0,"transferReversedAmount":0,"platformFee":0,"stripeFee":0,"extraFee":0,"baseFee":0,"personalFee":0,"transferAmount":0}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "chargeId"`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "params" SET DEFAULT '{"refundedTransactionAmount":0,"refundedApplicationFeeAmount":0,"platformFee":0,"stripeFee":0,"extraFee":0,"baseFee":0,"personalFee":0}'`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionFees1700583822001 implements MigrationInterface {
  name = 'transactionFees1700583822001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "params" SET DEFAULT '{"refundedTransactionAmount":0,"refundedApplicationFeeAmount":0,"platformFee":0,"stripeFee":0,"extraFee":0,"baseFee":0,"personalFee":0}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "params" SET DEFAULT '{"refundedTransactionAmount":0,"refundedApplicationFeeAmount":0,"platformFee":0,"stripeFee":0}'`,
    );
  }
}

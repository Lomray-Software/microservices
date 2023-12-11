import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionChargeAndDispute1701791863603 implements MigrationInterface {
  name = 'transactionChargeAndDispute1701791863603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_chargerefundstatus_enum" AS ENUM('noRefund', 'partialRefund', 'fullRefund')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "chargeRefundStatus" "public"."transaction_chargerefundstatus_enum" NOT NULL DEFAULT 'noRefund'`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "isDisputed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum" RENAME TO "transaction_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('success', 'inProcess', 'requiredPayment', 'initial', 'expired', 'refunded', 'partialRefunded', 'refundFailed', 'refundCanceled', 'refundInProcess', 'error')`,
    );
    await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "public"."transaction_status_enum" USING "status"::"text"::"public"."transaction_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'initial'`,
    );
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum_old" AS ENUM('success', 'inProcess', 'requiredPayment', 'initial', 'expired', 'refunded', 'partialRefunded', 'refundFailed', 'refundCanceled', 'refundInProcess', 'error', 'disputed')`,
    );
    await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "public"."transaction_status_enum_old" USING "status"::"text"::"public"."transaction_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'initial'`,
    );
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum_old" RENAME TO "transaction_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "isDisputed"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "chargeRefundStatus"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_chargerefundstatus_enum"`);
  }
}

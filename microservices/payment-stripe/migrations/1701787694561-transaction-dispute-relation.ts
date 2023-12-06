import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionDisputeRelation1701787694561 implements MigrationInterface {
  name = 'transactionDisputeRelation1701787694561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum" RENAME TO "transaction_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('success', 'inProcess', 'requiredPayment', 'initial', 'expired', 'refunded', 'partialRefunded', 'refundFailed', 'refundCanceled', 'refundInProcess', 'error', 'disputed')`,
    );
    await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "public"."transaction_status_enum" USING "status"::"text"::"public"."transaction_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'initial'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."refund_status_enum" AS ENUM('initial', 'inProcess', 'requiresAction', 'success', 'error', 'canceled')`,
    );
    await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "refund" ALTER COLUMN "status" TYPE "public"."refund_status_enum" USING "status"::"text"::"public"."refund_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "status" SET DEFAULT 'initial'`);
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum_old" AS ENUM('success', 'inProcess', 'requiredPayment', 'initial', 'expired', 'error', 'refunded', 'refundFailed', 'refundCanceled', 'refundInProcess', 'partialRefunded')`,
    );
    await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "refund" ALTER COLUMN "status" TYPE "public"."transaction_status_enum_old" USING "status"::"text"::"public"."transaction_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "status" SET DEFAULT 'initial'`);
    await queryRunner.query(`DROP TYPE "public"."refund_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum_old" RENAME TO "transaction_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum_old" AS ENUM('success', 'inProcess', 'requiredPayment', 'initial', 'expired', 'error', 'refunded', 'refundFailed', 'refundCanceled', 'refundInProcess', 'partialRefunded')`,
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
  }
}

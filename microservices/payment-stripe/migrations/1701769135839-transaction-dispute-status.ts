import { MigrationInterface, QueryRunner } from 'typeorm';

export default class transactionDisputeStatus1701769135839 implements MigrationInterface {
  name = 'transactionDisputeStatus1701769135839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_disputestatus_enum" AS ENUM('notDisputed', 'disputed', 'disputeClosed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "disputeStatus" "public"."transaction_disputestatus_enum" NOT NULL DEFAULT 'notDisputed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "disputeStatus"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_disputestatus_enum"`);
  }
}

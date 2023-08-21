import { MigrationInterface, QueryRunner } from 'typeorm';

export default class refund1692635371272 implements MigrationInterface {
  name = 'refund1692635371272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Update transaction type values
     */
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum" ADD VALUE 'partialRefunded'`,
    );

    /**
     * Create refund table
     */
    await queryRunner.query(
      `CREATE TABLE "refund" (id uuid, "transactionId" varchar(66) NOT NULL, "amount" integer NOT NULL, "entityId" character varying(36), "params" json NOT NULL DEFAULT '{}', "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'initial', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "refund(pk):id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Revert transaction type
     */
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum" DROP VALUE 'partialRefunded'`,
    );

    /**
     * Drop refund table
     */
    await queryRunner.query(`DROP TABLE "refund"`);
  }
}

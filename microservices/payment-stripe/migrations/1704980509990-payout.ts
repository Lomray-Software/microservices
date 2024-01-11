import { MigrationInterface, QueryRunner } from 'typeorm';

export default class payout1704980509990 implements MigrationInterface {
  name = 'payout1704980509990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payout_method_enum" AS ENUM('standard', 'instant')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payout_type_enum" AS ENUM('card', 'bankAccount')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payout_status_enum" AS ENUM('paid', 'pending', 'inTransit', 'canceled', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payout" ("id" SERIAL NOT NULL, "payoutId" character varying(66) NOT NULL, "destination" character varying(66) NOT NULL, "method" "public"."payout_method_enum" NOT NULL, "type" "public"."payout_type_enum" NOT NULL, "status" "public"."payout_status_enum" NOT NULL, "currency" character varying(10) NOT NULL, "failureCode" character varying(20), "failureMessage" text, "description" text, "arrivalDate" TIMESTAMP WITH TIME ZONE NOT NULL, "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "payout(pk):id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE "public"."payout_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payout_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payout_method_enum"`);
    await queryRunner.query(`DROP TABLE "payout"`);
  }
}

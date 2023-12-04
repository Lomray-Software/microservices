import { MigrationInterface, QueryRunner } from 'typeorm';

export default class dispute1701685975841 implements MigrationInterface {
  name = 'dispute1701685975841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "evidence_details" ("disputeId" uuid NOT NULL, "hasEvidence" boolean NOT NULL DEFAULT false, "submissionCount" integer NOT NULL DEFAULT '0', "dueBy" TIMESTAMP, "isPastBy" boolean NOT NULL, CONSTRAINT "evidence_details(uq):disputeId" UNIQUE ("disputeId"), CONSTRAINT "evidence_details(pk):disputeId" PRIMARY KEY ("disputeId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dispute_reason_enum" AS ENUM('bankCannotProcess', 'checkReturned', 'creditNotProcessed', 'customerInitiated', 'debitNotAuthorized', 'duplicate', 'fraudulent', 'general', 'incorrectAccountDetails', 'insufficientFunds', 'productNotReceived', 'productUnacceptable', 'subscriptionCanceled', 'unrecognized')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dispute_status_enum" AS ENUM('warningNeedsResponse', 'warningUnderReview', 'warningClosed', 'needsResponse', 'underReview', 'won', 'lost')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dispute" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying(66), "disputeId" character varying(66) NOT NULL, "amount" integer NOT NULL, "chargedAmount" integer NOT NULL DEFAULT '0', "chargedFees" integer NOT NULL DEFAULT '0', "netWorth" integer NOT NULL DEFAULT '0', "reason" "public"."dispute_reason_enum" NOT NULL, "status" "public"."dispute_status_enum" NOT NULL, "params" json NOT NULL DEFAULT '{}', "metadata" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "dispute(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "evidence_details" ADD CONSTRAINT "evidence_details(fk):disputeId" FOREIGN KEY ("disputeId") REFERENCES "dispute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "evidence_details" DROP CONSTRAINT "evidence_details(fk):disputeId"`,
    );
    await queryRunner.query(`DROP TABLE "dispute"`);
    await queryRunner.query(`DROP TYPE "public"."dispute_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."dispute_reason_enum"`);
    await queryRunner.query(`DROP TABLE "evidence_details"`);
  }
}

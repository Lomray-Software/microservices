import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645793882509 implements MigrationInterface {
  name = 'init1645793882509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "config" ("id" SERIAL NOT NULL, "microservice" character varying(50) NOT NULL, "type" character varying(30) NOT NULL, "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "config(uq):microservice_type" UNIQUE ("microservice", "type"), CONSTRAINT "config(fk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."middleware_type_enum" AS ENUM('request', 'response')`,
    );
    await queryRunner.query(
      `CREATE TABLE "middleware" ("id" SERIAL NOT NULL, "target" character varying(30) NOT NULL, "targetMethod" character varying(30) NOT NULL, "sender" character varying(30) NOT NULL, "senderMethod" character varying(30) NOT NULL, "type" "public"."middleware_type_enum" NOT NULL DEFAULT 'request', "order" integer NOT NULL DEFAULT '9', "description" character varying(500) NOT NULL DEFAULT '', "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "middleware(uq):sender_senderMethod_target_targetMethod_type" UNIQUE ("sender", "senderMethod", "target", "targetMethod", "type"), CONSTRAINT "middleware(fk):id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "middleware"`);
    await queryRunner.query(`DROP TYPE "public"."middleware_type_enum"`);
    await queryRunner.query(`DROP TABLE "config"`);
  }
}

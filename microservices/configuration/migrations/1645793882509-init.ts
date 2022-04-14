import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645793882509 implements MigrationInterface {
  name = 'init1645793882509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "config" ("id" SERIAL NOT NULL, "microservice" character varying(50) NOT NULL, "type" character varying(30) NOT NULL, "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_323f96882b5330a0354a6ed0110" UNIQUE ("microservice", "type"), CONSTRAINT "PK_d0ee79a681413d50b0a4f98cf7b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."middleware_type_enum" AS ENUM('request', 'response')`,
    );
    await queryRunner.query(
      `CREATE TABLE "middleware" ("id" SERIAL NOT NULL, "target" character varying(30) NOT NULL, "targetMethod" character varying(30) NOT NULL, "sender" character varying(30) NOT NULL, "senderMethod" character varying(30) NOT NULL, "order" integer NOT NULL DEFAULT '9', "type" "public"."middleware_type_enum" NOT NULL DEFAULT 'request', "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_28fc6aa1217c1f02f1ec4274718" UNIQUE ("sender", "senderMethod", "target", "targetMethod", "type"), CONSTRAINT "PK_aced9b1bc194d77dd07ddd4d092" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "middleware"`);
    await queryRunner.query(`DROP TYPE "public"."middleware_type_enum"`);
    await queryRunner.query(`DROP TABLE "config"`);
  }
}

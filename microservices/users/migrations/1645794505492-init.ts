import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645794505492 implements MigrationInterface {
  name = 'init1645794505492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."profile_gender_enum" AS ENUM('notKnown', 'male', 'female', 'notSpecified')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("userId" uuid NOT NULL, "gender" "public"."profile_gender_enum" NOT NULL DEFAULT 'notKnown', "birthDay" date, "photo" character varying(3000), "params" json NOT NULL DEFAULT '{}', "location" character varying(500), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "profile(pk):userId" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(25) NOT NULL, "lastName" character varying(25) NOT NULL DEFAULT '', "middleName" character varying(25) NOT NULL DEFAULT '', "email" character varying(70), "phone" character varying(20), "password" character varying, "username" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "user(uq):email" UNIQUE ("email"), CONSTRAINT "user(uq):phone" UNIQUE ("phone"), CONSTRAINT "user(uq):username" UNIQUE ("username"), CONSTRAINT "user(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."identity_provider_provider_enum" AS ENUM('firebase')`,
    );
    await queryRunner.query(
      `CREATE TABLE "identity_provider" ("userId" uuid NOT NULL, "provider" "public"."identity_provider_provider_enum" NOT NULL, "identifier" character varying(70) NOT NULL, "type" character varying(20), "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "identity_provider(pk):userId" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "confirm_code" ("login" character varying NOT NULL, "code" character varying NOT NULL, "expirationAt" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "confirm_code(pk):login" PRIMARY KEY ("login"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD CONSTRAINT "profile(fk):userId_id" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "identity_provider" ADD CONSTRAINT "identity_provider(fk):userId_id" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "identity_provider" DROP CONSTRAINT "identity_provider(fk):userId_id"`,
    );
    await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "profile(fk):userId_id"`);
    await queryRunner.query(`DROP TABLE "confirm_code"`);
    await queryRunner.query(`DROP TABLE "identity_provider"`);
    await queryRunner.query(`DROP TYPE "public"."identity_provider_provider_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
  }
}

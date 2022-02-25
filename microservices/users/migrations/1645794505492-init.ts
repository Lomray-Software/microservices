import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645794505492 implements MigrationInterface {
  name = 'init1645794505492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."profile_gender_enum" AS ENUM('notKnown', 'male', 'female', 'notSpecified')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("userId" uuid NOT NULL, "gender" "public"."profile_gender_enum" NOT NULL DEFAULT 'notKnown', "birthDay" date, "photo" character varying(255), "params" json NOT NULL DEFAULT '{}', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "REL_a24972ebd73b106250713dcddd" UNIQUE ("userId"), CONSTRAINT "PK_a24972ebd73b106250713dcddd9" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(25) NOT NULL, "lastName" character varying(25) NOT NULL DEFAULT '', "middleName" character varying(25) NOT NULL DEFAULT '', "email" character varying(50), "phone" character varying(20), "password" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."identity_provider_provider_enum" AS ENUM('firebase')`,
    );
    await queryRunner.query(
      `CREATE TABLE "identity_provider" ("userId" uuid NOT NULL, "provider" "public"."identity_provider_provider_enum" NOT NULL, "identifier" character varying(70) NOT NULL, "type" character varying(20), "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_9d4ac53db35d502894a9a5e8492" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "confirm_code" ("login" character varying NOT NULL, "code" character varying NOT NULL, "expirationAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d7c755dc719b76c97d353b85ee" PRIMARY KEY ("login"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD CONSTRAINT "FK_a24972ebd73b106250713dcddd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "identity_provider" ADD CONSTRAINT "FK_9d4ac53db35d502894a9a5e8492" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "identity_provider" DROP CONSTRAINT "FK_9d4ac53db35d502894a9a5e8492"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" DROP CONSTRAINT "FK_a24972ebd73b106250713dcddd9"`,
    );
    await queryRunner.query(`DROP TABLE "confirm_code"`);
    await queryRunner.query(`DROP TABLE "identity_provider"`);
    await queryRunner.query(`DROP TYPE "public"."identity_provider_provider_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
  }
}

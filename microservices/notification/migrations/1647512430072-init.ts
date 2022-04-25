import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1647512430072 implements MigrationInterface {
  name = 'init1647512430072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('email', 'phone')`);
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."message_type_enum" NOT NULL, "from" character varying NOT NULL, "to" character varying NOT NULL, "subject" character varying NOT NULL, "text" text NOT NULL, "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "message(fk):id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
  }
}

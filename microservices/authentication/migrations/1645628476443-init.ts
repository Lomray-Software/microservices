import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645628476443 implements MigrationInterface {
  name = 'init1645639804535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."token_type_enum" AS ENUM('jwt', 'personal')`);
    await queryRunner.query(
      `CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."token_type_enum" NOT NULL, "userId" character varying(36) NOT NULL, "personal" character varying(32), "access" character varying(300), "refresh" character varying(300), "expirationAt" TIMESTAMP, "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fc16f8ff67106143227c8658ea1" UNIQUE ("type", "userId", "personal", "access"), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_68a815ecbf74e6dd56ef3b8bfb" ON "token" ("personal") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_68a815ecbf74e6dd56ef3b8bfb"`);
    await queryRunner.query(`DROP TABLE "token"`);
    await queryRunner.query(`DROP TYPE "public"."token_type_enum"`);
  }
}

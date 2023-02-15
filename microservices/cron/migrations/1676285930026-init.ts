import type { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1676285930026 implements MigrationInterface {
  name = 'init1676285930026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."history_status_enum" AS ENUM('running', 'error', 'success')`,
    );
    await queryRunner.query(
      `CREATE TABLE "history" ("id" SERIAL NOT NULL, "taskId" integer NOT NULL, "status" "public"."history_status_enum" NOT NULL, "response" json NOT NULL DEFAULT '{}', "executionTime" numeric(6,2) NOT NULL DEFAULT 0, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "history(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" SERIAL NOT NULL, "nodeId" character varying(50) NOT NULL DEFAULT 'node1', "rule" character varying(50) NOT NULL, "method" character varying(100) NOT NULL, "description" character varying(255) NOT NULL DEFAULT '', "payload" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "task(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ADD CONSTRAINT "history(fk):taskId_id" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "history" DROP CONSTRAINT "history(fk):taskId_id"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TABLE "history"`);
    await queryRunner.query(`DROP TYPE "public"."history_status_enum"`);
  }
}

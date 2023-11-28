import { MigrationInterface, QueryRunner } from 'typeorm';

export default class task1701182756187 implements MigrationInterface {
  name = 'task1701182756187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."task_type_enum" AS ENUM('noticeAll', 'emailAll')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_status_enum" AS ENUM('init', 'waiting', 'failed', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."task_type_enum" NOT NULL, "lastFailTargetId" uuid, "status" "public"."task_status_enum" NOT NULL DEFAULT 'init', "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "task(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "message" ADD "taskId" uuid`);
    await queryRunner.query(`ALTER TABLE "notice" ADD "taskId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "message(fk):taskId" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice" ADD CONSTRAINT "notice(fk):taskId" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notice" DROP CONSTRAINT "notice(fk):taskId"`);
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "message(fk):taskId"`);
    await queryRunner.query(`ALTER TABLE "notice" DROP COLUMN "taskId"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "taskId"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
  }
}

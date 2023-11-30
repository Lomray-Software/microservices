import { MigrationInterface, QueryRunner } from 'typeorm';

export default class recipient1701305305692 implements MigrationInterface {
  name = 'recipient1701305305692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recipient" ("userId" uuid NOT NULL, "taskId" uuid NOT NULL, "messageId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "recipient(uq):userId_taskId" UNIQUE ("userId", "taskId"), CONSTRAINT "recipient(rel):messageId" UNIQUE ("messageId"), CONSTRAINT "recipient(pk):userId" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(`ALTER TABLE "message" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TYPE "public"."task_type_enum" RENAME TO "task_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."task_type_enum" AS ENUM('noticeAll', 'emailAll', 'emailGroup')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "type" TYPE "public"."task_type_enum" USING "type"::"text"::"public"."task_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."task_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "recipient" ADD CONSTRAINT "recipient(fk):taskId" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipient" ADD CONSTRAINT "recipient(fk):messageId" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipient" DROP CONSTRAINT "recipient(fk):taskId"`);
    await queryRunner.query(`ALTER TABLE "recipient" DROP CONSTRAINT "recipient(fk):messageId"`);
    await queryRunner.query(
      `CREATE TYPE "public"."task_type_enum_old" AS ENUM('noticeAll', 'emailAll')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "type" TYPE "public"."task_type_enum_old" USING "type"::"text"::"public"."task_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."task_type_enum_old" RENAME TO "task_type_enum"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "userId"`);
    await queryRunner.query(`DROP TABLE "recipient"`);
  }
}

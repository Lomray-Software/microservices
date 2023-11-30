import { MigrationInterface, QueryRunner } from 'typeorm';

export default class taskMode1701295119446 implements MigrationInterface {
  name = 'taskMode1701295119446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."task_mode_enum" AS ENUM('default', 'fullCheckUp')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "mode" "public"."task_mode_enum" NOT NULL DEFAULT 'default'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "mode"`);
    await queryRunner.query(`DROP TYPE "public"."task_mode_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export default class recipientPrimaryKey1701875260392 implements MigrationInterface {
  name = 'recipientPrimaryKey1701875260392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipient" ADD COLUMN "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "recipient" DROP CONSTRAINT "recipient(pk):userId"`);
    await queryRunner.query(
      `ALTER TABLE "recipient" ADD CONSTRAINT "recipient(pk):id" PRIMARY KEY ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipient" DROP CONSTRAINT "recipient(pk):id"`);
    await queryRunner.query(
      `ALTER TABLE "recipient" ADD CONSTRAINT "recipient(pk):userId" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(`ALTER TABLE "recipient" DROP COLUMN "id"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export default class messageTemplate1701258758976 implements MigrationInterface {
  name = 'messageTemplate1701258758976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" ADD "html" text`);
    await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "from" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "to" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "to" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "from" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "html"`);
  }
}

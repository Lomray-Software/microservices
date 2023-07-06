import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1688581612749 implements MigrationInterface {
  name = 'init1688581612749';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" ADD "attachments" json NOT NULL DEFAULT '[]'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "attachments"`);
  }
}

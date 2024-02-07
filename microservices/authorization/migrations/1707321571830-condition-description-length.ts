import { MigrationInterface, QueryRunner } from 'typeorm';

export default class conditionDescriptionLength1707321571830 implements MigrationInterface {
  name = 'conditionDescriptionLength1707321571830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condition" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "condition" ADD "description" character varying(1000) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condition" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "condition" ADD "description" character varying(255) NOT NULL DEFAULT ''`,
    );
  }
}

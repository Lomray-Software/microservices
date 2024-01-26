import { MigrationInterface, QueryRunner } from 'typeorm';

export default class conditionDescription1706284451402 implements MigrationInterface {
  name = 'conditionDescription1706284451402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "condition" ADD "description" character varying(255) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condition" DROP COLUMN "description"`);
  }
}

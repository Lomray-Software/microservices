import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddMetadataToPrice1753736525000 implements MigrationInterface {
  name = 'AddMetadataToPrice1753736525000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "price"
      ADD COLUMN "metadata" jsonb DEFAULT null
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "price"
      DROP COLUMN "metadata"
    `);
  }
}

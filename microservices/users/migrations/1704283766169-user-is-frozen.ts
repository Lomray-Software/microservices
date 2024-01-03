import { MigrationInterface, QueryRunner } from 'typeorm';

export default class userIsFrozen1704283766169 implements MigrationInterface {
  name = 'userIsFrozen1704283766169';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "isFrozen" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isFrozen"`);
  }
}

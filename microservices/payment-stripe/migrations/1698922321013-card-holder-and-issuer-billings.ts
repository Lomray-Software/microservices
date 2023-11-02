import { MigrationInterface, QueryRunner } from 'typeorm';

export default class cardHolderAndIssuerBillings1698922321013 implements MigrationInterface {
  name = 'cardHolderAndIssuerBillings1698922321013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" ADD "origin" character varying(5)`);
    await queryRunner.query(`ALTER TABLE "card" ADD "country" character varying(5)`);
    await queryRunner.query(`ALTER TABLE "card" ADD "postalCode" character varying(10)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "postalCode"`);
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "origin"`);
  }
}

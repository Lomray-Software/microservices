import { MigrationInterface, QueryRunner } from 'typeorm';

export default class promoCodeMaxRedemptions1692806259412 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Add column
     */
    await queryRunner.query(`ALTER TABLE "promo_code" ADD COLUMN "maxRedemptions" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Drop column
     */
    await queryRunner.query(`ALTER TABLE "promo_code" DROP COLUMN "maxRedemptions"`);
  }
}

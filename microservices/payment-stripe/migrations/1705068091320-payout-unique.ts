import { MigrationInterface, QueryRunner } from 'typeorm';

export default class payoutUnique1705068091320 implements MigrationInterface {
  name = 'payoutUnique1705068091320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payout" ADD CONSTRAINT "payout(uq):payoutId" UNIQUE ("payoutId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payout" DROP CONSTRAINT "payout(uq):payoutId"`);
  }
}

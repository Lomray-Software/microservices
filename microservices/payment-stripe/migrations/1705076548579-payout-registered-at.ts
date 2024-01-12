import { MigrationInterface, QueryRunner } from 'typeorm';

export default class payoutRegisteredAt1705076548579 implements MigrationInterface {
  name = 'payoutRegisteredAt1705076548579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payout" ADD "registeredAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payout" DROP COLUMN "registeredAt"`);
  }
}

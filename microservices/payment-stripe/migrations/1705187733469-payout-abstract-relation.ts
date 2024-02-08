import { MigrationInterface, QueryRunner } from 'typeorm';

export default class payoutAbstractRelation1705187733469 implements MigrationInterface {
  name = 'payoutAbstractRelation1705187733469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payout" ADD "entityId" character varying(36)`);
    await queryRunner.query(
      `ALTER TABLE "payout" ADD "registeredAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "payout" ALTER COLUMN "destination" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payout" DROP COLUMN "registeredAt"`);
    await queryRunner.query(`ALTER TABLE "payout" DROP COLUMN "entityId"`);
    await queryRunner.query(`ALTER TABLE "payout" ALTER COLUMN "destination" SET NOT NULL`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export default class refundId1692718250835 implements MigrationInterface {
  name = 'refundId1692718250835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refund" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "id" SET DEFAULT NULL`);
  }
}

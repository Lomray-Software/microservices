import { MigrationInterface, QueryRunner } from 'typeorm';

export default class cardPaymentMethod1699352296715 implements MigrationInterface {
  name = 'cardPaymentMethod1699352296715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" ADD "paymentMethodId" character varying(66)`);
    await queryRunner.query(`ALTER TABLE "card" ADD "fingerprint" character varying(30)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "paymentMethodId"`);
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "fingerprint"`);
  }
}

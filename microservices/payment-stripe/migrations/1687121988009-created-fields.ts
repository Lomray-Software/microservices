import { MigrationInterface, QueryRunner } from 'typeorm';

export default class createdFields1687121988009 implements MigrationInterface {
  name = 'createdFields1687121988009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "price" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "price" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "price" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "price" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "createdAt"`);
  }
}

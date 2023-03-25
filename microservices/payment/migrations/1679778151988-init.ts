import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1679778151988 implements MigrationInterface {
  name = 'init1679778151988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "customer" ("customerId" character varying(18) NOT NULL, "userId" character varying(36) NOT NULL, CONSTRAINT "customer(pk):customerId_userId" PRIMARY KEY ("customerId", "userId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_payment_userId" ON "customer" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_payment_userId"`);
    await queryRunner.query(`DROP TABLE "customer"`);
  }
}

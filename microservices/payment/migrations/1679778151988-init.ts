import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1679778151988 implements MigrationInterface {
  name = 'init1679778151988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "customer" ("customerId" character varying(18) NOT NULL, "userId" character varying(36) NOT NULL, "params" json NOT NULL DEFAULT '{}', CONSTRAINT "customer(pk):customerId_userId" PRIMARY KEY ("customerId", "userId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_payment_userId" ON "customer" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "product" ("productId" character varying(19) NOT NULL, "entityId" character varying(36) NOT NULL, "userId" character varying(36), CONSTRAINT "product(pk):productId_entityId" PRIMARY KEY ("productId", "entityId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "price" ("priceId" character varying(30) NOT NULL, "productId" character varying(19) NOT NULL, "userId" character varying(36), "currency" character varying(10) NOT NULL, "unitAmount" integer NOT NULL, CONSTRAINT "price(rel):productId" UNIQUE ("productId"), CONSTRAINT "price(pk):priceId" PRIMARY KEY ("priceId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "price" ADD CONSTRAINT "price(fk):productId_productId" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_product_userId" ON "product" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_price_userId" ON "price" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_payment_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_price_userId"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "price(fk):productId_productId"`);
    await queryRunner.query(`DROP TABLE "price"`);
    await queryRunner.query(`DROP TABLE "product"`);
  }
}

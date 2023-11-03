import { MigrationInterface, QueryRunner } from 'typeorm';

export default class cart1698656203251 implements MigrationInterface {
  name = 'cart1698656203251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36), "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "cart(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_product_price" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cartId" uuid NOT NULL, "priceId" character varying NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "cart_product_price(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product_price" ADD CONSTRAINT "cart_product_price(fk):cartId" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product_price" ADD CONSTRAINT "cart_product_price(fk):priceId" FOREIGN KEY ("priceId") REFERENCES "price"("priceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_product_price" DROP CONSTRAINT "cart_product_price(fk):priceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product_price" DROP CONSTRAINT "cart_product_price(fk):cartId"`,
    );

    await queryRunner.query(`DROP TABLE "cart_product_price"`);
    await queryRunner.query(`DROP TABLE "cart"`);
  }
}

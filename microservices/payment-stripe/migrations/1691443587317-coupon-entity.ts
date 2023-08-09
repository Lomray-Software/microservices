import { MigrationInterface, QueryRunner } from 'typeorm';

export default class couponEntity1691443587317 implements MigrationInterface {
  name = 'couponEntity1691443587317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Types
     */
    await queryRunner.query(
      `CREATE TYPE "public"."coupon_duration_enum" AS ENUM('ones', 'repeating', 'forever')`,
    );

    /**
     * Tables
     */
    await queryRunner.query(
      `CREATE TABLE "promo_code" ("promoCodeId" character varying(30) NOT NULL, "code" character varying NOT NULL, "couponId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "couponPromoCodeId" character varying(30), CONSTRAINT "promo_code(pk):promoCodeId" PRIMARY KEY ("promoCodeId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon" ("couponId" character varying(8) NOT NULL, "name" character varying, "amountOff" double precision, "percentOff" integer, "duration" "public"."coupon_duration_enum" NOT NULL, "durationInMonths" integer, "maxRedemptions" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "coupon(pk):couponId" PRIMARY KEY ("couponId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon_products_product" ("couponId" character varying(8) NOT NULL, "productId" character varying(19) NOT NULL, CONSTRAINT "coupon_products_product(pk):couponId_productId" PRIMARY KEY ("couponId", "productId"))`,
    );

    /**
     * Constraints
     */
    await queryRunner.query(
      `ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code(fk):couponPromoCodeId_promoCodeId" FOREIGN KEY ("couponPromoCodeId") REFERENCES "promo_code"("promoCodeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" ADD CONSTRAINT "coupon_products_product(fk):couponId" FOREIGN KEY ("couponId") REFERENCES "coupon"("couponId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" ADD CONSTRAINT "coupon_products_product(fk):productId" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    /**
     * Indexes
     */
    await queryRunner.query(
      `CREATE INDEX "IDX_coupon_products_product_couponId" ON "coupon_products_product" ("couponId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_coupon_products_product_productId" ON "coupon_products_product" ("productId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Types
     */
    await queryRunner.query(`DROP TYPE "public"."coupon_duration_enum"`);

    /**
     * Indexes
     */
    await queryRunner.query(`DROP INDEX "public"."IDX_coupon_products_product_couponId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_coupon_products_product_productId"`);

    /**
     * Constraints
     */
    await queryRunner.query(
      `ALTER TABLE "promo_code" DROP CONSTRAINT "promo_code(fk):couponPromoCodeId_promoCodeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" DROP CONSTRAINT "coupon_products_product(fk):couponId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" DROP CONSTRAINT "coupon_products_product(fk):productId"`,
    );

    /**
     * Tables
     */
    await queryRunner.query(`DROP TABLE "coupon_products_product"`);
    await queryRunner.query(`DROP TABLE "coupon"`);
    await queryRunner.query(`DROP TABLE "promo_code"`);
  }
}

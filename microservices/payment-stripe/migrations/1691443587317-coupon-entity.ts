import { MigrationInterface, QueryRunner } from 'typeorm';

export default class couponEntity1691443587317 implements MigrationInterface {
  name = 'couponEntity1691443587317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promo_code" ("promoCodeId" character varying(30) NOT NULL, "code" character varying NOT NULL, "couponId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "couponPromoCodeId" character varying(30), CONSTRAINT "PK_6aeee3e0180adf2bf461b066a82" PRIMARY KEY ("promoCodeId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."coupon_duration_enum" AS ENUM('ones', 'repeating', 'forever')`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon" ("couponId" character varying(8) NOT NULL, "name" character varying, "amountOff" double precision, "percentOff" integer, "duration" "public"."coupon_duration_enum" NOT NULL, "durationInMonths" integer, "maxRedemptions" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_85a34266f36892347867b21d6ad" PRIMARY KEY ("couponId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupon_products_product" ("couponId" character varying(8) NOT NULL, "productId" character varying(19) NOT NULL, CONSTRAINT "PK_0bd6a4b75fc235663fff0cdfc2b" PRIMARY KEY ("couponId", "productId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_006cd586575d86f4705186b869" ON "coupon_products_product" ("couponId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bdd320620afd063015fa0976ae" ON "coupon_products_product" ("productId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_code" ADD CONSTRAINT "FK_8db7b0ac755956ce3d0cb6266b8" FOREIGN KEY ("couponPromoCodeId") REFERENCES "promo_code"("promoCodeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" ADD CONSTRAINT "FK_006cd586575d86f4705186b869a" FOREIGN KEY ("couponId") REFERENCES "coupon"("couponId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" ADD CONSTRAINT "FK_bdd320620afd063015fa0976ae1" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" DROP CONSTRAINT "FK_bdd320620afd063015fa0976ae1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products_product" DROP CONSTRAINT "FK_006cd586575d86f4705186b869a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_code" DROP CONSTRAINT "FK_8db7b0ac755956ce3d0cb6266b8"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_bdd320620afd063015fa0976ae"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_006cd586575d86f4705186b869"`);
    await queryRunner.query(`DROP TABLE "coupon_products_product"`);
    await queryRunner.query(`DROP TABLE "coupon"`);
    await queryRunner.query(`DROP TYPE "public"."coupon_duration_enum"`);
    await queryRunner.query(`DROP TABLE "promo_code"`);
  }
}

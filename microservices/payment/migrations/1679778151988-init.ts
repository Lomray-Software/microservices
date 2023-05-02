import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1679778151988 implements MigrationInterface {
  name = 'init1679778151988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "customer" ("customerId" character varying(18) NOT NULL, "userId" character varying(36) NOT NULL, "params" json NOT NULL DEFAULT '{}', CONSTRAINT "customer(pk):customerId" PRIMARY KEY ("customerId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_payment_userId" ON "customer" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "product" ("productId" character varying(19) NOT NULL, "entityId" character varying(36) NOT NULL, "userId" character varying(36), CONSTRAINT "product(pk):productId" PRIMARY KEY ("productId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "price" ("priceId" character varying(30) NOT NULL, "productId" character varying(19) NOT NULL, "userId" character varying(36), "currency" character varying(10) NOT NULL, "unitAmount" integer NOT NULL, CONSTRAINT "price(rel):productId" UNIQUE ("productId"), CONSTRAINT "price(pk):priceId" PRIMARY KEY ("priceId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_type_enum" AS ENUM('credit', 'debit')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('succeded', 'requires_action', 'requires_payment_method', 'error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "customer(uq):userId" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying(66) NOT NULL, "title" character varying(100) NOT NULL, "userId" character varying(36) NOT NULL, "bankAccountId" character varying(66) NOT NULL, "cardId" character varying(66) NOT NULL, "entityId" character varying(66) NOT NULL, "amount" integer NOT NULL, "tax" integer NOT NULL, "fee" integer NOT NULL, "status" "public"."transaction_status_enum" NOT NULL, "type" "public"."transaction_type_enum" NOT NULL, "transactionStatus" character varying(18) NOT NULL, "errorMessage" character varying(150) NOT NULL, CONSTRAINT "transaction(pk):transactionId" PRIMARY KEY ("transactionId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "price" ADD CONSTRAINT "price(fk):productId_productId" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "transaction(fk):userId" FOREIGN KEY ("userId") REFERENCES "customer"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_product_userId" ON "product" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_price_userId" ON "price" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_payment_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_price_userId"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
    await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "price(fk):productId_productId"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "product(pk):productId"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "transaction(fk):userId"`);
    await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "customer(pk):customerId"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "price"`);
    await queryRunner.query(`DROP TABLE "product"`);
  }
}

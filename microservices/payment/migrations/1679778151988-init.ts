import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1679778151988 implements MigrationInterface {
  name = 'init1679778151988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Types
     */
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_type_enum" AS ENUM('credit', 'debit')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('success', 'inProcess', 'requiredPayment', 'initial', 'expired', 'error', 'refunded', 'refundFailed', 'refundCanceled', 'refundInProcess')`,
    );

    /**
     * Tables
     */
    await queryRunner.query(
      `CREATE TABLE "customer" ("customerId" character varying(18) NOT NULL, "userId" character varying(36) NOT NULL, "params" json NOT NULL DEFAULT '{}', CONSTRAINT "customer(pk):customerId" PRIMARY KEY ("customerId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("productId" character varying(19) NOT NULL, "entityId" character varying(36) NOT NULL, "userId" character varying(36), CONSTRAINT "product(pk):productId" PRIMARY KEY ("productId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "price" ("priceId" character varying(30) NOT NULL, "productId" character varying(19) NOT NULL, "userId" character varying(36) NOT NULL, "currency" character varying(10) NOT NULL, "unitAmount" integer NOT NULL, CONSTRAINT "price(rel):productId" UNIQUE ("productId"), CONSTRAINT "price(pk):priceId" PRIMARY KEY ("priceId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying(66) NOT NULL, "title" character varying(100) NOT NULL DEFAULT '', "userId" character varying(36) NOT NULL, "bankAccountId" character varying(66), "cardId" character varying(66), "paymentMethodId" character varying(66), "entityId" character varying(36) NOT NULL, "productId" character varying(19), "amount" integer NOT NULL, "type" "public"."transaction_type_enum" NOT NULL, "tax" integer NOT NULL, "fee" integer NOT NULL, "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'initial', "params" json NOT NULL DEFAULT '{}', CONSTRAINT "transaction(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36) NOT NULL, "lastDigits" character varying(4) NOT NULL, "bankName" character varying(100), "holderName" character varying(100), "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "bank_account(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36) NOT NULL, "lastDigits" character varying(4) NOT NULL, "params" json NOT NULL DEFAULT '{}', "expired" character varying(5) NOT NULL, "holderName" character varying(100) NOT NULL DEFAULT '', "type" character varying(20) NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "card(pk):id" PRIMARY KEY ("id"))`,
    );

    /**
     * Constraints
     */
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "customer(uq):userId" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "card(fk):userId" FOREIGN KEY ("userId") REFERENCES "customer"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account(fk):userId" FOREIGN KEY ("userId") REFERENCES "customer"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price" ADD CONSTRAINT "price(fk):productId_productId" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "transaction(fk):customerId" FOREIGN KEY ("userId") REFERENCES "customer"("customerId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "transaction(fk):productId" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    /**
     * Indexes
     */
    await queryRunner.query(`CREATE INDEX "IDX_card_userId" ON "bank_account" ("userId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_bank_account_lastDigits" ON "bank_account" ("lastDigits") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bank_account_bankName" ON "bank_account" ("bankName") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_product_userId" ON "product" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_price_userId" ON "price" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_payment_userId" ON "customer" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Types
     */
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);

    /**
     * Indexes
     */
    await queryRunner.query(`DROP INDEX "public"."IDX_payment_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_price_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_card_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bank_account_lastDigits"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bank_account_bankName"`);

    /**
     * Constraints
     */
    await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "customer(pk):customerId"`);
    await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "card(fk):userId"`);
    await queryRunner.query(`ALTER TABLE "bank_account" DROP CONSTRAINT "bank_account(fk):userId"`);
    await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "price(fk):productId_productId"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "product(pk):productId"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "transaction(fk):userId"`);
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "transaction(fk):productId"`,
    );

    /**
     * Tables
     */
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "price"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "card"`);
  }
}

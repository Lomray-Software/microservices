import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1693301991584 implements MigrationInterface {
  name = 'init1693301991584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Tables
     */
    await queryRunner.query(
      `CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36), "title" character varying(255) NOT NULL, "alias" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "content" text NOT NULL DEFAULT '', "publishDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "article(uq):alias" UNIQUE ("alias"), CONSTRAINT "article(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "alias" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "category(uq):alias" UNIQUE ("alias"), CONSTRAINT "category(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories_articles" ("categoryId" uuid NOT NULL, "articleId" uuid NOT NULL, CONSTRAINT "categories_articles(pk):categoryId_articleId" PRIMARY KEY ("categoryId", "articleId"))`,
    );

    /**
     * Indexes
     */
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_articles_categoryId" ON "categories_articles" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_articles_articleId" ON "categories_articles" ("articleId") `,
    );

    /**
     * Constraints
     */
    await queryRunner.query(
      `ALTER TABLE "categories_articles" ADD CONSTRAINT "categories_articles(fk):categoryId" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories_articles" ADD CONSTRAINT "categories_articles(fk):articleId" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Constraints
     */
    await queryRunner.query(
      `ALTER TABLE "categories_articles" DROP CONSTRAINT "categories_articles(fk):articleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories_articles" DROP CONSTRAINT "categories_articles(fk):categoryId"`,
    );

    /**
     * Indexes
     */
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_articles_articleId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_articles_categoryId"`);

    /**
     * Tables
     */
    await queryRunner.query(`DROP TABLE "categories_articles"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "article"`);
  }
}

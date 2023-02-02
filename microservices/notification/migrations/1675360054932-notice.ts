import type { MigrationInterface, QueryRunner } from 'typeorm';

export default class notice1675360054932 implements MigrationInterface {
  name = 'notice1675360054932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" ADD "noticeId" uuid`);
    await queryRunner.query(
      `CREATE TABLE "notice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "userId" character varying(36), "title" character varying NOT NULL, "description" text NOT NULL, "isViewed" boolean NOT NULL DEFAULT false, "isHidden" boolean NOT NULL DEFAULT false, "params" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "notice(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_notice_userId" ON "notice" ("userId") `);
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "message(fk):noticeId_id" FOREIGN KEY ("noticeId") REFERENCES "notice"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_notice_userId"`);
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "message(fk):noticeId_id"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "noticeId"`);
    await queryRunner.query(`DROP TABLE "notice"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export default class useUseridAndUseragentAsPk1742223121658 implements MigrationInterface {
  name = 'useUseridAndUseragentAsPk1742223121658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_fcm_token_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fcm_token_token"`);
    await queryRunner.query(`ALTER TABLE "fcm_token" DROP CONSTRAINT IF EXISTS "PK_fcm_token"`);
    await queryRunner.query(`UPDATE "fcm_token"
                             SET "userAgent" = ''
                             WHERE "userAgent" IS NULL`);
    await queryRunner.query(`ALTER TABLE "fcm_token"
      ALTER COLUMN "userAgent" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "fcm_token"
      ADD CONSTRAINT "PK_fcm_token_new" PRIMARY KEY ("userId", "userAgent")`);
    await queryRunner.query(`ALTER TABLE "fcm_token"
      ADD CONSTRAINT "UQ_fcm_token_token" UNIQUE ("token")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fcm_token" DROP CONSTRAINT "UQ_fcm_token_token"`);
    await queryRunner.query(`ALTER TABLE "fcm_token" DROP CONSTRAINT "PK_fcm_token_new"`);
    await queryRunner.query(`ALTER TABLE "fcm_token"
      ALTER COLUMN "userAgent" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "fcm_token"
      ADD CONSTRAINT "PK_fcm_token" PRIMARY KEY ("token")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fcm_token_token" ON "fcm_token" ("token") `);
    await queryRunner.query(`CREATE INDEX "IDX_fcm_token_userId" ON "fcm_token" ("userId") `);
  }
}

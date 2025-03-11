import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddFcmTokenTable1709913600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fcm_token"
      (
        "userId"    varchar(36)  NOT NULL,
        "token"     varchar(255) NOT NULL,
        "userAgent" varchar(255),
        "createdAt" TIMESTAMP    NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fcm_token" PRIMARY KEY ("token")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_fcm_token_userId" ON "fcm_token" ("userId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_fcm_token_token" ON "fcm_token" ("token")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_fcm_token_token"`);
    await queryRunner.query(`DROP INDEX "IDX_fcm_token_userId"`);
    await queryRunner.query(`DROP TABLE "fcm_token"`);
  }
}

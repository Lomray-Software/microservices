import { MigrationInterface, QueryRunner } from 'typeorm';

export default class folder1675351152994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "folderId" uuid`);
    await queryRunner.query(
      `CREATE TABLE "folder" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36), "alias" character varying(50) NOT NULL, "title" character varying(50) NOT NULL, "order" real NOT NULL DEFAULT '999', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "folder(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "folder_parent_folder" ("parentId" uuid NOT NULL, "childrenId" uuid NOT NULL, CONSTRAINT "folder_parent_folder(pk):parentId_childrenId" PRIMARY KEY ("parentId", "childrenId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_file_userId" ON "file" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_folder_userId" ON "folder" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_folder_alias" ON "folder" ("alias") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_folder_parent_folder_childrenId" ON "folder_parent_folder" ("childrenId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_folder_parent_folder_parentId" ON "folder_parent_folder" ("parentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "folder_parent_folder" ADD CONSTRAINT "folder_parent_folder(fk):parentId" FOREIGN KEY ("parentId") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "folder_parent_folder" ADD CONSTRAINT "folder_parent_folder(fk):childrenId" FOREIGN KEY ("childrenId") REFERENCES "folder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "file(fk):folderId_id" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_folder_parent_folder_childrenId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_folder_parent_folder_parentId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_folder_alias"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_folder_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_file_userId"`);
    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "file(fk):folderId_id"`);
    await queryRunner.query(
      `ALTER TABLE "folder_parent_folder" DROP CONSTRAINT "folder_parent_folder(fk):childrenId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folder_parent_folder" DROP CONSTRAINT "folder_parent_folder(fk):parentId"`,
    );
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "folderId"`);
    await queryRunner.query(`DROP TABLE "folder_parent_folder"`);
    await queryRunner.query(`DROP TABLE "folder"`);
  }
}

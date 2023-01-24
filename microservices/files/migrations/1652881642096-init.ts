import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1652881642096 implements MigrationInterface {
  name = 'init1652881642096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."file_type_enum" AS ENUM('image', 'video', 'file')`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36), "url" character varying(255) NOT NULL, "alt" character varying(150) NOT NULL DEFAULT '', "type" "public"."file_type_enum" NOT NULL, "formats" json NOT NULL DEFAULT '{}', "meta" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "file(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityId" character varying(36) NOT NULL, "fileId" uuid NOT NULL, "type" character varying(30) NOT NULL, "microservice" character varying(50) NOT NULL, "order" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "file_entity(uq):entityId_fileId_microservice_type" UNIQUE ("entityId", "fileId", "microservice", "type"), CONSTRAINT "file_entity(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_entity" ADD CONSTRAINT "file_entity(fk):fileId" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file_entity" DROP CONSTRAINT "file_entity(fk):fileId"`);
    await queryRunner.query(`DROP TABLE "file_entity"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TYPE "public"."file_type_enum"`);
  }
}

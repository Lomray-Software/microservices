import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1652881642096 implements MigrationInterface {
  name = 'init1652881642096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."attachment_type_enum" AS ENUM('image', 'video', 'file')`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(36), "url" character varying(255) NOT NULL, "alt" character varying(150) NOT NULL DEFAULT '', "type" "public"."attachment_type_enum" NOT NULL, "formats" json NOT NULL DEFAULT '{}', "meta" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "attachment(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachment_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityId" character varying(36) NOT NULL, "attachmentId" uuid NOT NULL, "type" character varying(30) NOT NULL, "microservice" character varying(50) NOT NULL, "order" integer NOT NULL DEFAULT '1', CONSTRAINT "attachment_entity(uq):entityId_attachmentId_microservice_type" UNIQUE ("entityId", "attachmentId", "microservice", "type"), CONSTRAINT "attachment_entity(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment_entity" ADD CONSTRAINT "attachment_entity(fk):attachmentId" FOREIGN KEY ("attachmentId") REFERENCES "attachment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attachment_entity" DROP CONSTRAINT "attachment_entity(fk):attachmentId"`,
    );
    await queryRunner.query(`DROP TABLE "attachment_entity"`);
    await queryRunner.query(`DROP TABLE "attachment"`);
    await queryRunner.query(`DROP TYPE "public"."attachment_type_enum"`);
  }
}

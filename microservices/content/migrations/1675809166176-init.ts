import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1675809166176 implements MigrationInterface {
  name = 'init1675809166176';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "component" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "alias" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "schema" json NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "component(uq):alias" UNIQUE ("alias"), CONSTRAINT "component(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "single_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "alias" character varying(255) NOT NULL, "value" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "singleType(uq):alias" UNIQUE ("alias"), CONSTRAINT "singleType(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "component_parent_component" ("childrenId" uuid NOT NULL, "parentId" uuid NOT NULL, CONSTRAINT "component_parent_component(pk:childrenId_parentId" PRIMARY KEY ("childrenId", "parentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_component_parent_component_childrenId" ON "component_parent_component" ("childrenId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_component_parent_component_parentId" ON "component_parent_component" ("parentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "singleTypes_components" ("singleTypeId" uuid NOT NULL, "componentId" uuid NOT NULL, CONSTRAINT "PK_singleTypes_components_singleTypeId_componentId" PRIMARY KEY ("singleTypeId", "componentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_singleTypes_components_singleTypeId" ON "singleTypes_components" ("singleTypeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_singleTypes_components_componentId" ON "singleTypes_components" ("componentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "component_parent_component" ADD CONSTRAINT "component_parent_component(fk):childrenId" FOREIGN KEY ("childrenId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "component_parent_component" ADD CONSTRAINT "component_parent_component(fk):parentId" FOREIGN KEY ("parentId") REFERENCES "component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "singleTypes_components" ADD CONSTRAINT "singleTypes_components(fk):singleTypeId" FOREIGN KEY ("singleTypeId") REFERENCES "single_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "singleTypes_components" ADD CONSTRAINT "singleTypes_components(fk):componentId" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "singleTypes_components" DROP CONSTRAINT "singleTypes_components(fk):singleTypeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "singleTypes_components" DROP CONSTRAINT "singleTypes_components(fk):componentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "component_parent_component" DROP CONSTRAINT "component_parent_component(fk):childrenId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "component_parent_component" DROP CONSTRAINT "component_parent_component(fk):parentId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_singleTypes_components_singleTypeId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_singleTypes_components_componentId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_component_parent_component_parentId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_component_parent_component_childrenId"`);
    await queryRunner.query(`DROP TABLE "singleTypes_components"`);
    await queryRunner.query(`DROP TABLE "component_parent_component"`);
    await queryRunner.query(`DROP TABLE "single_type"`);
    await queryRunner.query(`DROP TABLE "component"`);
  }
}

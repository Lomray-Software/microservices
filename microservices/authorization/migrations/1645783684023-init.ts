import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645783684023 implements MigrationInterface {
  name = 'init1645783684023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "model" ("id" SERIAL NOT NULL, "microservice" character varying(50), "alias" character varying(150) NOT NULL, "title" character varying(50) NOT NULL, "schema" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "model(uq):alias" UNIQUE ("alias"), CONSTRAINT "model(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "method" ("id" SERIAL NOT NULL, "microservice" character varying(50), "method" character varying(100) NOT NULL, "description" character varying(255) NOT NULL DEFAULT '', "allowGroup" text array NOT NULL DEFAULT '{}', "denyGroup" text array NOT NULL DEFAULT '{}', "modelInId" integer, "modelOutId" integer, "conditionId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "method(uq):microservice_method" UNIQUE ("microservice", "method"), CONSTRAINT "method(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("alias" character varying(30) NOT NULL, "parentAlias" character varying(30) DEFAULT NULL, "name" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "role(pk):alias" PRIMARY KEY ("alias"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."method_filter_operator_enum" AS ENUM('only', 'and')`,
    );
    await queryRunner.query(
      `CREATE TABLE "method_filter" ("methodId" integer NOT NULL, "filterId" integer NOT NULL, "operator" "public"."method_filter_operator_enum" NOT NULL, "roleAlias" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "method_filter(uq):methodId_filterId_roleAlias" UNIQUE ("methodId", "filterId", "roleAlias"), CONSTRAINT "method_filter(pk):methodId_filterId" PRIMARY KEY ("methodId", "filterId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "filter" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "condition" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "filter(uq):title" UNIQUE ("title"), CONSTRAINT "filter(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "condition" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "conditions" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "condition(uq):title" UNIQUE ("title"), CONSTRAINT "condition(pk):id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("userId" character varying(36) NOT NULL, "roleAlias" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "user_role(pk):userId_roleAlias" PRIMARY KEY ("userId", "roleAlias"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "method" ADD CONSTRAINT "method(fk):modelInId_id" FOREIGN KEY ("modelInId") REFERENCES "model"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method" ADD CONSTRAINT "method(fk):modelOutId_id" FOREIGN KEY ("modelOutId") REFERENCES "model"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method" ADD CONSTRAINT "method(fk):conditionId_id" FOREIGN KEY ("conditionId") REFERENCES "condition"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "role(fk):parentAlias_alias" FOREIGN KEY ("parentAlias") REFERENCES "role"("alias") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" ADD CONSTRAINT "method_filter(fk):filterId_id" FOREIGN KEY ("filterId") REFERENCES "filter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" ADD CONSTRAINT "method_filter(fk):methodId_id" FOREIGN KEY ("methodId") REFERENCES "method"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" ADD CONSTRAINT "method_filter(fk):roleAlias_alias" FOREIGN KEY ("roleAlias") REFERENCES "role"("alias") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "user_role(fk):roleAlias_alias" FOREIGN KEY ("roleAlias") REFERENCES "role"("alias") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE VIEW "roles_tree" AS
    WITH RECURSIVE roles_graph (alias, path, cycle) AS (
      SELECT r.alias, ARRAY[alias]::varchar[] as path, false
      FROM role as r
      UNION ALL
      SELECT g.alias, g.alias || rg.path, g.alias = ANY(rg.path)
      FROM role as g, roles_graph as rg
      WHERE rg.alias = g."parentAlias" AND NOT cycle
    )
    SELECT DISTINCT ON (alias) alias, path, array_length(path, 1) AS depth FROM roles_graph
    ORDER BY alias, depth DESC;
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'roles_tree',
        'WITH RECURSIVE roles_graph (alias, path, cycle) AS (\n      SELECT r.alias, ARRAY[alias]::varchar[] as path, false\n      FROM role as r\n      UNION ALL\n      SELECT g.alias, g.alias || rg.path, g.alias = ANY(rg.path)\n      FROM role as g, roles_graph as rg\n      WHERE rg.alias = g."parentAlias" AND NOT cycle\n    )\n    SELECT DISTINCT ON (alias) alias, path, array_length(path, 1) AS depth FROM roles_graph\n    ORDER BY alias, depth DESC;',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'roles_tree', 'public'],
    );
    await queryRunner.query(`DROP VIEW "roles_tree"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "user_role(fk):roleAlias_alias"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" DROP CONSTRAINT "method_filter(fk):roleAlias_alias"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" DROP CONSTRAINT "method_filter(fk):methodId_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" DROP CONSTRAINT "method_filter(fk):filterId_id"`,
    );
    await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "role(fk):parentAlias_alias"`);
    await queryRunner.query(`ALTER TABLE "method" DROP CONSTRAINT "method(fk):modelOutId_id"`);
    await queryRunner.query(`ALTER TABLE "method" DROP CONSTRAINT "method(fk):modelInId_id"`);
    await queryRunner.query(`ALTER TABLE "method" DROP CONSTRAINT "method(fk):conditionId_id"`);
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "filter"`);
    await queryRunner.query(`DROP TABLE "condition"`);
    await queryRunner.query(`DROP TABLE "method_filter"`);
    await queryRunner.query(`DROP TYPE "public"."method_filter_operator_enum"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "method"`);
    await queryRunner.query(`DROP TABLE "model"`);
  }
}

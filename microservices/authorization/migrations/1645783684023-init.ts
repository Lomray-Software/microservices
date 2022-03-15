import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1645783684023 implements MigrationInterface {
  name = 'init1645783684023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "model" ("id" SERIAL NOT NULL, "microservice" character varying(50), "alias" character varying(50) NOT NULL, "title" character varying(50) NOT NULL, "schema" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c1d9be113aa490dd35f2daaa553" UNIQUE ("alias"), CONSTRAINT "PK_d6df271bba301d5cc79462912a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "method" ("id" SERIAL NOT NULL, "microservice" character varying(50), "method" character varying(100) NOT NULL, "description" character varying(255) NOT NULL DEFAULT '', "allowGroup" text array NOT NULL DEFAULT '{}', "denyGroup" text array NOT NULL DEFAULT '{}', "modelInId" integer, "modelOutId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9c1f21eeb5fd48835d9945a3ff1" UNIQUE ("microservice", "method"), CONSTRAINT "PK_def6b33cb9809fb4b8ac44c69ae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("alias" character varying(30) NOT NULL, "parentAlias" character varying(30), "name" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe3119b8577cd8704656ee51d05" PRIMARY KEY ("alias"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."method_filter_operator_enum" AS ENUM('only', 'and')`,
    );
    await queryRunner.query(
      `CREATE TABLE "method_filter" ("methodId" integer NOT NULL, "filterId" integer NOT NULL, "operator" "public"."method_filter_operator_enum" NOT NULL, "roleAlias" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_db66b3f7bc06ad8cc9ce16d9337" UNIQUE ("methodId", "filterId", "roleAlias"), CONSTRAINT "PK_9480bfa74f19e78d3316377a0c7" PRIMARY KEY ("methodId", "filterId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "filter" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "condition" json NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3c5d89c1607d52ce265c7348f70" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("userId" character varying(36) NOT NULL, "roleAlias" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0c29ca5adefdf897101f87fe904" PRIMARY KEY ("userId", "roleAlias"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "method" ADD CONSTRAINT "FK_13389398a20bb99eced46d377b0" FOREIGN KEY ("modelInId") REFERENCES "model"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method" ADD CONSTRAINT "FK_4c591977f7daf28d1bc54e47e37" FOREIGN KEY ("modelOutId") REFERENCES "model"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "FK_93e5339851ddcf0b2fd35caa8d7" FOREIGN KEY ("parentAlias") REFERENCES "role"("alias") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" ADD CONSTRAINT "FK_d3589c3bdefb89c30610140eff1" FOREIGN KEY ("filterId") REFERENCES "filter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" ADD CONSTRAINT "FK_7647a24d2dccbee89a9fe1c7a99" FOREIGN KEY ("methodId") REFERENCES "method"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" ADD CONSTRAINT "FK_2483984033d3d27b7991f796b4e" FOREIGN KEY ("roleAlias") REFERENCES "role"("alias") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_9fc43b1db54a661348510eed5fa" FOREIGN KEY ("roleAlias") REFERENCES "role"("alias") ON DELETE CASCADE ON UPDATE NO ACTION`,
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

    // Create default roles
    await queryRunner.query(
      `
      INSERT INTO public.role (alias, "parentAlias", name, "createdAt", "updatedAt") VALUES ('guest', null, 'Guest', '2022-02-25 10:11:22.570142', '2022-02-25 10:11:22.570142');
      INSERT INTO public.role (alias, "parentAlias", name, "createdAt", "updatedAt") VALUES ('user', 'guest', 'User', '2022-02-25 10:11:34.858224', '2022-02-25 10:11:34.858224');
      INSERT INTO public.role (alias, "parentAlias", name, "createdAt", "updatedAt") VALUES ('admin', 'user', 'Admin', '2022-02-25 10:11:47.364353', '2022-02-25 10:11:47.364353');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'roles_tree', 'public'],
    );
    await queryRunner.query(`DROP VIEW "roles_tree"`);
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_9fc43b1db54a661348510eed5fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" DROP CONSTRAINT "FK_2483984033d3d27b7991f796b4e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" DROP CONSTRAINT "FK_7647a24d2dccbee89a9fe1c7a99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method_filter" DROP CONSTRAINT "FK_d3589c3bdefb89c30610140eff1"`,
    );
    await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_93e5339851ddcf0b2fd35caa8d7"`);
    await queryRunner.query(
      `ALTER TABLE "method" DROP CONSTRAINT "FK_4c591977f7daf28d1bc54e47e37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "method" DROP CONSTRAINT "FK_13389398a20bb99eced46d377b0"`,
    );
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "filter"`);
    await queryRunner.query(`DROP TABLE "method_filter"`);
    await queryRunner.query(`DROP TYPE "public"."method_filter_operator_enum"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "method"`);
    await queryRunner.query(`DROP TABLE "model"`);
  }
}

import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
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
  `,
})
class RolesTree {
  @ViewColumn()
  alias: string;

  /**
   * IMPORTANT! Order matters
   * Order by: DESC
   * E.g.: users => guest (not guest => users)
   */
  @ViewColumn()
  path: string[];

  @ViewColumn()
  depth: number;
}

export default RolesTree;

import type { ConnectionOptions } from 'typeorm';
import { IS_BUILD, DB_ENV, SRC_FOLDER } from '@constants/index';

const { URL, HOST, PORT, USERNAME, PASSWORD, DATABASE } = DB_ENV;
const migrationsSrc = IS_BUILD ? 'lib/' : '';

/**
 * Database connection options
 */
const db = (rootPath = SRC_FOLDER, migrationPath = migrationsSrc): ConnectionOptions => ({
  type: 'postgres',
  ...((URL?.length ?? 0) > 0
    ? {
        url: URL,
      }
    : {
        host: HOST,
        port: PORT,
        username: USERNAME,
        password: PASSWORD,
        database: DATABASE,
      }),
  entities: [`${rootPath}/entities/*.{ts,js}`],
  subscribers: [`${rootPath}/subscribers/*.{ts,js}`],
  migrations: [`${migrationPath}migrations/*.{ts,js}`],
  cli: {
    migrationsDir: `${migrationPath}migrations`,
    // we shouldn't work with this in production
    entitiesDir: `${rootPath}/entities`,
    subscribersDir: `${rootPath}/subscribers`,
  },
  migrationsRun: true,
  synchronize: false,
  logging: false,
});

export default db;
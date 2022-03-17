import type { ConnectionOptions } from 'typeorm';
import { DB_ENV, IS_BUILD, SRC_FOLDER } from '@constants/index';

const { URL, HOST, PORT, USERNAME, PASSWORD, DATABASE } = DB_ENV;
const migrationsSrc = IS_BUILD ? 'lib/' : '';

const db: ConnectionOptions = {
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
  entities: [`${SRC_FOLDER}/entities/*.{ts,js}`],
  subscribers: [`${SRC_FOLDER}/subscribers/*.{ts,js}`],
  migrations: [`${migrationsSrc}migrations/*.{ts,js}`],
  cli: {
    migrationsDir: `${migrationsSrc}migrations`,
    // we shouldn't work with this in production
    entitiesDir: `${SRC_FOLDER}/entities`,
    subscribersDir: `${SRC_FOLDER}/subscribers`,
  },
  migrationsRun: true,
  synchronize: false,
  logging: false,
};

export default db;

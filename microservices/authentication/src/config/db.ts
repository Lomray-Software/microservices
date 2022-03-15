import type { ConnectionOptions } from 'typeorm';
import { DB_ENV, SRC_FOLDER } from '@constants/index';

const { URL, HOST, PORT, USERNAME, PASSWORD, DATABASE } = DB_ENV;

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
  migrations: [`${SRC_FOLDER}/migrations/*.{ts,js}`],
  cli: {
    migrationsDir: `${SRC_FOLDER}/migrations`,
    // we shouldn't work with this in production
    entitiesDir: `${SRC_FOLDER}/entities`,
    subscribersDir: `${SRC_FOLDER}/subscribers`,
  },
  migrationsRun: true,
  synchronize: false,
  logging: false,
};

export default db;

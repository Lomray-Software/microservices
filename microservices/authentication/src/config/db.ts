import type { ConnectionOptions } from 'typeorm';
import { DB_ENV } from '@constants/index';

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
  entities: ['src/entities/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  migrations: ['migrations/*.{ts,js}'],
  cli: {
    migrationsDir: 'migrations',
    // we shouldn't work with this in production
    entitiesDir: 'src/entities',
    subscribersDir: 'src/subscribers',
  },
  migrationsRun: true,
  synchronize: false,
  logging: false,
};

export default db;

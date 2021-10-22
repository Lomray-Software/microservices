import { Gateway } from '@lomray/microservice-nodejs-lib';
import cors from 'cors';
import { MS_NAME, MS_CONNECTION } from '@constants/environment';
import { version } from '../package.json';

const microservice = Gateway.create({
  name: MS_NAME,
  connection: MS_CONNECTION,
  version,
});
const express = microservice.getExpress();

express.use(
  cors({
    exposedHeaders: ['Guest-Id', 'Jwt-Access-Token', 'Jwt-Refresh-Token'],
  }),
);

microservice.start().catch((e: Error) => `Failed to start: ${e.message}`);

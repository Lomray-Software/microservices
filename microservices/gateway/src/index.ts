import { Gateway } from '@lomray/microservice-nodejs-lib';
import cors from 'cors';
import { MICROSERVICE_NAME, IJSON_CONNECTION } from '@constants/environment';

const microservice = Gateway.create({
  name: MICROSERVICE_NAME,
  connection: IJSON_CONNECTION,
});
const express = microservice.getExpress();

express.use(
  cors({
    exposedHeaders: ['Guest-Id', 'Jwt-Access-Token', 'Jwt-Refresh-Token'],
  }),
);

microservice.start().catch((e: Error) => `Failed to start: ${e.message}`);

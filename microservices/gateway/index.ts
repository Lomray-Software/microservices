import { Gateway } from '@lomray/microservice-nodejs-lib';
import cors from 'cors';

const microservice = Gateway.create({
  name: 'gateway',
});
const express = microservice.getExpress();

express.use(cors({
  exposedHeaders: ['Guest-Id', 'Jwt-Access-Token', 'Jwt-Refresh-Token'],
}));

microservice.start().catch((e) => `Failed to start: ${e.message}`);

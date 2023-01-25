/* eslint-disable import/prefer-default-export */
// noinspection JSUnusedGlobalSymbols

import { Log } from '@lomray/microservice-helpers';
import sinon from 'sinon';
import CONST from '@constants/index';

process.env.TYPEORM_MOCK_ENTITIES = JSON.stringify([
  `node_modules/${CONST.EXTEND_PACKAGE_NAME}/entities/*.{ts,js}`,
]);
process.env.TYPEORM_MOCK_SUBSCRIBERS = JSON.stringify([
  `node_modules/${CONST.EXTEND_PACKAGE_NAME}/subscribers/*.{ts,js}`,
]);

/**
 * Mocha root hooks
 */
export const mochaHooks = {
  beforeAll(): void {
    sinon.stub(console, 'info');
    Log.configure({ silent: true });
    Log.transports.find((transport) => Log.remove(transport));
  },
  afterAll(): void {
    sinon.restore();
  },
};

/* eslint-disable import/prefer-default-export */
// noinspection JSUnusedGlobalSymbols

import { Log } from '@lomray/microservice-helpers';
import sinon from 'sinon';

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

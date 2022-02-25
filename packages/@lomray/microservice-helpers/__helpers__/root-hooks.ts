/* eslint-disable import/prefer-default-export */
// noinspection JSUnusedGlobalSymbols

import sinon from 'sinon';
import Log from '@services/log';

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

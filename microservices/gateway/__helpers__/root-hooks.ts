/* eslint-disable import/prefer-default-export */
// noinspection JSUnusedGlobalSymbols

import { Log, RemoteConfig } from '@lomray/microservice-helpers';
import { Gateway } from '@lomray/microservice-nodejs-lib';
import sinon from 'sinon';

/**
 * Mocha root hooks
 */
export const mochaHooks = {
  beforeAll(): void {
    sinon.stub(console, 'info');
    Log.configure({ silent: true });
    Log.transports.find((transport) => Log.remove(transport));
    RemoteConfig.init(Gateway.create(), { isOffline: true, msConfigName: '', msName: '' });
  },
  afterAll(): void {
    sinon.restore();
  },
};

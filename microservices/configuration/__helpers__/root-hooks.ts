/* eslint-disable import/prefer-default-export */
// noinspection JSUnusedGlobalSymbols

import { Log } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareServer } from '@lomray/microservice-remote-middleware';
import sinon from 'sinon';
import MiddlewareRepository from '@repositories/middleware-repository';

/**
 * Mocha root hooks
 */
export const mochaHooks = {
  beforeAll(): void {
    sinon.stub(console, 'info');
    Log.configure({ silent: true });
    Log.transports.find((transport) => Log.remove(transport));

    // Need for some middlewares methods
    RemoteMiddlewareServer.create(
      Microservice.getInstance(),
      TypeormMock.entityManager.getCustomRepository(MiddlewareRepository),
    );
  },
  afterAll(): void {
    sinon.restore();
  },
};

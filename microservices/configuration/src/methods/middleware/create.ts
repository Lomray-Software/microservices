import { Endpoint } from '@lomray/microservice-helpers';
import {
  RemoteMiddlewareActionType,
  RemoteMiddlewareServer,
} from '@lomray/microservice-remote-middleware';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * Create middleware
 */
const create = Endpoint.create(
  () => ({
    repository: getRepository(Middleware),
    description: 'Create middleware and register it on target microservice workers',
  }),
  async (fields) => {
    const entity = (await Endpoint.defaultHandler.create<Middleware, Middleware>({
      fields,
      repository: getRepository(Middleware),
    })) as Middleware;

    const { target, targetMethod, sender, senderMethod, params } = entity;

    await RemoteMiddlewareServer.getInstance().remoteRegister({
      action: RemoteMiddlewareActionType.ADD,
      target,
      targetMethod,
      sender,
      senderMethod,
      params,
    });

    return entity;
  },
);

export default create;

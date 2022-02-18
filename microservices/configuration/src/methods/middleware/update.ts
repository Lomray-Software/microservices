import { Endpoint } from '@lomray/microservice-helpers';
import {
  RemoteMiddlewareActionType,
  RemoteMiddlewareServer,
} from '@lomray/microservice-remote-middleware';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * Update middleware
 */
const update = Endpoint.update(
  () => ({
    repository: getRepository(Middleware),
    description: 'Update middleware and update it on target microservice workers',
  }),
  async (typeQuery, fields: Partial<Middleware>) => {
    const entity = await Endpoint.defaultHandler.update<Middleware>(
      typeQuery.toQuery(),
      fields,
      getRepository(Middleware),
    );

    const { target, targetMethod, sender, senderMethod, params } = entity;

    await RemoteMiddlewareServer.getInstance().remoteRegister({
      action: RemoteMiddlewareActionType.ADD,
      target,
      targetMethod,
      sender,
      senderMethod,
      params,
    });

    return { result: entity };
  },
);

export default update;

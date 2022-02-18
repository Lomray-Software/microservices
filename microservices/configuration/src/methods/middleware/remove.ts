import { Endpoint } from '@lomray/microservice-helpers';
import {
  RemoteMiddlewareActionType,
  RemoteMiddlewareServer,
} from '@lomray/microservice-remote-middleware';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * Remove middleware
 */
const remove = Endpoint.remove(
  () => ({
    repository: getRepository(Middleware),
    description: 'Remove middleware and deregister it on target microservice workers',
  }),
  async (typeQuery) => {
    const { deleted, entities } = await Endpoint.defaultHandler.remove(
      getRepository(Middleware),
      typeQuery.toQuery(),
      {
        isAllowMultiple: false,
        isSoftDelete: false,
        shouldReturnEntity: true,
      },
    );

    if (entities?.[0]) {
      const [{ target, targetMethod, sender, senderMethod }] = entities;

      await RemoteMiddlewareServer.getInstance().remoteRegister({
        action: RemoteMiddlewareActionType.REMOVE,
        target,
        targetMethod,
        sender,
        senderMethod,
      });
    }

    return { deleted };
  },
);

export default remove;

import _ from 'lodash';
import type Endpoints from '@helpers/api/endpoints';

/**
 * Authorization commands
 */
class AuthorizationCommands {
  /**
   * @private
   */
  private endpoints: Endpoints;

  /**
   * @private
   */
  private rollbackActions: (() => Promise<void>)[] = [];

  /**
   * @constructor
   */
  constructor(endpoints: Endpoints) {
    this.endpoints = endpoints;
  }

  /**
   * Rollback authorizations permissions
   */
  public rollback = async (): Promise<void> => {
    await Promise.all(this.rollbackActions.map((func) => func()));

    this.rollbackActions = [];
  };

  /**
   * Detach filters from method
   */
  public detachFilters = async (method: string, filters: string[]): Promise<void> => {
    const { result: { entity: methodEntity } = {} } =
      await this.endpoints.authorization.endpoint.view(
        {
          query: {
            where: { method },
          },
        },
        {
          isDirectReq: true,
        },
      );

    if (!methodEntity || !filters.length) {
      return;
    }

    const { result: { list: filterEntities } = {} } =
      await this.endpoints.authorization.filter.list(
        {
          query: {
            where: {
              title: { in: filters },
            },
          },
        },
        {
          isDirectReq: true,
        },
      );

    if (!filterEntities) {
      return;
    }

    // for restore
    const { result: { list: methodFilters } = {} } =
      await this.endpoints.authorization.endpointFilter.list(
        {
          query: {
            where: {
              methodId: methodEntity.id,
              filterId: { in: _.map(filterEntities, 'id') },
            },
          },
        },
        {
          isDirectReq: true,
        },
      );

    if (!methodFilters) {
      return;
    }

    const { result } = await this.endpoints.authorization.endpointFilter.remove(
      {
        query: {
          where: {
            methodId: methodEntity.id,
            filterId: { in: _.map(filterEntities, 'id') },
          },
        },
        payload: {
          authorization: {
            filter: {
              methodOptions: {
                isAllowMultiple: true,
              },
            },
          },
        },
      },
      {
        isDirectReq: true,
      },
    );

    if (!result?.deleted?.length) {
      return;
    }

    // rollback method filters
    this.rollbackActions.push(async () => {
      await Promise.all(
        methodFilters.map((fields) =>
          this.endpoints.authorization.endpointFilter.create({ fields }, { isDirectReq: true }),
        ),
      );
    });
  };
}

export default AuthorizationCommands;

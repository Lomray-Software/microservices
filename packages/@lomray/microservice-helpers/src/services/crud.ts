import type { IEndpointHandler } from '@lomray/microservice-nodejs-lib';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import TypeormJsonQuery, {
  IJsonQuery,
  ITypeormJsonQueryOptions,
  ObjectLiteral,
} from '@lomray/typeorm-json-query';
import { validate } from 'class-validator';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import type { Repository } from 'typeorm/repository/Repository';

enum CRUD_EXCEPTION_CODE {
  VALIDATION_FAILED = 33481,
  MULTIPLE_INSERT_FORBIDDEN = 33482,
  FAILED_INSERT = 33483,
  FAILED_UPDATE = 33484,
  FAILED_DELETE = 33485,
  FAILED_RESTORE = 33486,
  ENTITY_NOT_FOUND = 33487,
}

type TEndpointHandlerParams<
  TParams = Record<string, any>,
  TPayload = Record<string, any>,
> = Parameters<IEndpointHandler<TParams, TPayload>>;

type ICrudHandler<TParams, TPayload, TResult, TEntity, TView = IListLazyResult<TEntity>> = (
  query: TypeormJsonQuery<TEntity>,
  params: TEndpointHandlerParams<TParams, TPayload>[0],
  options: TEndpointHandlerParams[1],
) => Promise<(TView & TResult) | TView> | ((TView & TResult) | TView);

type ICrudUpdateHandler<
  TParams,
  TPayload,
  TResult,
  TEntity,
  TView = IUpdateLazyResult<TEntity, TResult>,
> = (
  query: TypeormJsonQuery<TEntity>,
  fields: Partial<TEntity | TEntity[]>,
  params: TEndpointHandlerParams<TParams, TPayload>[0],
  options: TEndpointHandlerParams[1],
) => Promise<TView> | TView;

type ICrudEntityHandler<
  TParams,
  TPayload,
  TResult,
  TEntity,
  TView = IEntityResult<TEntity, TResult>,
> =
  | ((
      fields: Partial<TEntity | TEntity[]> | undefined,
      params: TEndpointHandlerParams<TParams, TPayload>[0],
      options: TEndpointHandlerParams[1],
    ) => Promise<TView> | TView)
  | null;

type ITypeormRequestParams<TEntity, TPayload> = TPayload & {
  query?: IJsonQuery<TEntity>;
};

type IRequestPayload<TEntity, TPayload> = TPayload & {
  authorization?: {
    filter?: IJsonQuery<TEntity>;
  };
};

type ICountRequestParams<TEntity, TParams> = TParams & {
  query?: IJsonQuery<TEntity>;
  hasRemoved?: boolean;
};

type IListRequestParams<TEntity, TParams> = TParams & {
  query?: IJsonQuery<TEntity>;
  hasRemoved?: boolean;
};

type IViewRequestParams<TEntity, TParams> = TParams & {
  query?: IJsonQuery<TEntity>;
};

type ICreateRequestParams<TEntity, TParams> = TParams & {
  fields?: Partial<TEntity | TEntity[]>;
};

type IUpdateRequestParams<TEntity, TParams> = TParams & {
  fields?: Partial<TEntity>;
  query?: IJsonQuery<TEntity>;
};

type IRemoveRequestParams<TEntity, TParams> = TParams & {
  query?: IJsonQuery<TEntity>;
};

type ICountLazyResult<TEntity> =
  | TypeormJsonQuery<TEntity>
  | SelectQueryBuilder<TEntity>
  | ({
      query?: TypeormJsonQuery<TEntity> | SelectQueryBuilder<TEntity>;
    } & ICountResult<TEntity>);

type IListLazyResult<TEntity> =
  | TypeormJsonQuery<TEntity>
  | SelectQueryBuilder<TEntity>
  | ({
      query?: TypeormJsonQuery<TEntity> | SelectQueryBuilder<TEntity>;
    } & IListResult<TEntity>);

type IViewLazyResult<TEntity> = TypeormJsonQuery<TEntity> | SelectQueryBuilder<TEntity> | TEntity;

type IUpdateLazyResult<TEntity, TResult> =
  | TypeormJsonQuery<TEntity>
  | SelectQueryBuilder<TEntity>
  | {
      query?: TypeormJsonQuery<TEntity> | SelectQueryBuilder<TEntity>;
      fields?: Partial<TEntity>;
      result?: IEntityResult<TEntity, TResult>;
    };

type IRemoveLazyResult<TEntity> =
  | TypeormJsonQuery<TEntity>
  | SelectQueryBuilder<TEntity>
  | IRemoveResult<TEntity>;

type IRestoreLazyResult<TEntity> =
  | TypeormJsonQuery<TEntity>
  | SelectQueryBuilder<TEntity>
  | IRestoreResult<TEntity>;

export type ICountResult<TEntity> = Required<Omit<IListResult<TEntity>, 'list'>>;

export type IRemoveResult<TEntity> = { deleted: Partial<TEntity>[] };

export type IRestoreResult<TEntity> = { restored: TEntity[] };

export type IListResult<TEntity> = {
  list: TEntity[];
  count?: number;
};

export type IEntityResult<TEntity, TResult> = (TEntity & TResult) | TEntity | TEntity[];

interface ICrudParams<TEntity> {
  repository: Repository<TEntity>;
  queryOptions?: Partial<ITypeormJsonQueryOptions>;
}

interface ICountParams<TEntity> extends ICrudParams<TEntity> {}

interface IListParams<TEntity> extends ICrudParams<TEntity> {
  isListWithCount?: boolean; // return entities with count
}

interface IViewParams<TEntity> extends ICrudParams<TEntity> {}

interface ICreateParams<TEntity> extends Omit<ICrudParams<TEntity>, 'queryOptions'> {
  isAllowMultiple?: boolean;
}

interface IUpdateParams<TEntity> extends ICrudParams<TEntity> {}

interface IRemoveParams<TEntity> extends ICrudParams<TEntity> {
  isAllowMultiple?: boolean;
  isSoftDelete?: boolean;
}

interface IRestoreParams<TEntity> extends ICrudParams<TEntity> {
  isAllowMultiple?: boolean;
}

type TCountReturn<TEntity, TParams, TPayload, TResult> = IEndpointHandler<
  ICountRequestParams<TEntity, TParams>,
  IRequestPayload<TEntity, TPayload>,
  ICountResult<TEntity> | (ICountResult<TEntity> & TResult)
>;

type TListReturn<TEntity, TParams, TPayload, TResult> = IEndpointHandler<
  IListRequestParams<TEntity, TParams>,
  IRequestPayload<TEntity, TPayload>,
  IListResult<TEntity> | (IListResult<TEntity> & TResult)
>;

type TViewReturn<TEntity, TParams, TPayload, TResult> = IEndpointHandler<
  IViewRequestParams<TEntity, TParams>,
  IRequestPayload<TEntity, TPayload>,
  IEntityResult<TEntity, TResult>
>;

type TCreateReturn<TEntity, TParams, TPayload, TResult> = IEndpointHandler<
  ICreateRequestParams<TEntity, TParams>,
  IRequestPayload<TPayload, TPayload>,
  IEntityResult<TEntity, TResult>
>;

type TUpdateReturn<TEntity, TParams, TPayload, TResult> = IEndpointHandler<
  IUpdateRequestParams<TEntity, TParams>,
  IRequestPayload<TEntity, TPayload>,
  IEntityResult<TEntity, TResult>
>;

type TRemoveReturn<TEntity, TParams, TPayload> = IEndpointHandler<
  IRemoveRequestParams<TEntity, TParams>,
  IRequestPayload<TEntity, TPayload>,
  IRemoveResult<TEntity>
>;

type TRestoreReturn<TEntity, TParams, TPayload> = IEndpointHandler<
  IRemoveRequestParams<TEntity, TParams>,
  IRequestPayload<TEntity, TPayload>,
  IRestoreResult<TEntity>
>;

type TOptions<THandlerOptions> = () => THandlerOptions;

type TControllerMethodParam<TParams> =
  | boolean
  | {
      path?: string;
      options?: TOptions<Omit<TParams, 'repository'>>;
    };

interface IControllerMethodsParams<TEntity> {
  count: TControllerMethodParam<ICountParams<TEntity>>;
  list: TControllerMethodParam<IListParams<TEntity>>;
  view: TControllerMethodParam<IViewParams<TEntity>>;
  create: TControllerMethodParam<ICreateParams<TEntity>>;
  update: TControllerMethodParam<IUpdateParams<TEntity>>;
  remove: TControllerMethodParam<IRemoveParams<TEntity>>;
  restore: TControllerMethodParam<IRestoreParams<TEntity>>;
}

interface IControllerReturn<TEntity> {
  count: TCountReturn<TEntity, Record<string, any>, Record<string, any>, Record<string, any>>;
  list: TListReturn<TEntity, Record<string, any>, Record<string, any>, Record<string, any>>;
  view: TViewReturn<TEntity, Record<string, any>, Record<string, any>, Record<string, any>>;
  create: TCreateReturn<TEntity, Record<string, any>, Record<string, any>, Record<string, any>>;
  update: TUpdateReturn<TEntity, Record<string, any>, Record<string, any>, Record<string, any>>;
  remove: TRemoveReturn<TEntity, Record<string, any>, Record<string, any>>;
  restore: TRestoreReturn<TEntity, Record<string, any>, Record<string, any>>;
}

/**
 * Create typeorm query instance based on request
 */
const createTypeQuery = <TEntity, TParams, TPayload>(
  queryBuilder: SelectQueryBuilder<TEntity>,
  params: TEndpointHandlerParams<
    ITypeormRequestParams<TEntity, TParams>,
    IRequestPayload<TEntity, TPayload>
  >[0],
  options: Partial<ITypeormJsonQueryOptions> = {},
): TypeormJsonQuery<TEntity> =>
  TypeormJsonQuery.init<TEntity>(
    {
      queryBuilder,
      query: params.query,
      authQuery: params.payload?.authorization?.filter,
    },
    options,
  );

/**
 * Check if query has empty where condition
 */
const hasEmptyCondition = <TEntity>(query: SelectQueryBuilder<TEntity>): boolean => {
  const [condition] = TypeormJsonQuery.qbWhereParse(query);

  return !condition;
};

/**
 * Default method handler
 */
const defaultHandler = <TEntity>(query: TypeormJsonQuery<TEntity>): TypeormJsonQuery<TEntity> =>
  query;

/**
 * Execute SelectQueryBuilder
 */
const getQueryCount = async <TEntity>(
  query: SelectQueryBuilder<TEntity>,
  hasRemoved = false,
): Promise<ICountResult<TEntity>> => {
  if (hasRemoved) {
    query.withDeleted();
  }

  return {
    count: await query.getCount(),
  };
};

/**
 * Execute SelectQueryBuilder
 */
const getQueryList = async <TEntity>(
  query: SelectQueryBuilder<TEntity>,
  isWithCount: boolean,
  hasRemoved = false,
): Promise<IListResult<TEntity>> => {
  if (hasRemoved) {
    query.withDeleted();
  }

  if (isWithCount) {
    const [list, count] = await query.getManyAndCount();

    return {
      list,
      count,
    };
  }

  return {
    list: await query.getMany(),
  };
};

/**
 * Default handler for create entity(ies)
 */
const createDefaultHandler = async <TEntity, TResult>({
  fields,
  repository,
  isAllowMultiple = false,
}: {
  fields: ICreateRequestParams<TEntity, any>['fields'];
  repository: ICrudParams<TEntity>['repository'];
  isAllowMultiple?: boolean;
}): Promise<IEntityResult<TEntity, TResult>> => {
  const isArray = Array.isArray(fields);
  const entitiesAttributes = isArray ? fields : [fields];

  if (!isAllowMultiple && entitiesAttributes.length > 1) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.MULTIPLE_INSERT_FORBIDDEN,
      status: 422,
      message: 'Error: you can create only one entity at a time.',
    });
  }

  const entities = entitiesAttributes.map((attributes) =>
    Object.assign(repository.create(), attributes),
  );
  const errors = (
    await Promise.all(
      entities.map((entity) => validate(entity, { whitelist: true, forbidNonWhitelisted: true })),
    )
  ).map((entityErrors) =>
    entityErrors.map(({ value, property, constraints }) => ({ value, property, constraints })),
  );

  if (errors[0].length > 0) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: validation failed for one or more entities.',
      payload: isArray ? errors : errors[0],
    });
  }

  try {
    const result = await repository.save(entities, { chunk: 20 });

    return isArray ? result : result[0];
  } catch (e) {
    const { detail } = e;
    let { message } = e;
    let payload;

    if (message.includes('duplicate key')) {
      payload = { original: message, detail };
      message = 'Error: this entry already exists.';
    }

    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.FAILED_INSERT,
      status: 500,
      message,
      payload,
    });
  }
};

/**
 * Default handler for view entity
 */
const viewDefaultHandler = async <TEntity>(
  query: SelectQueryBuilder<TEntity>,
): Promise<TEntity> => {
  if (hasEmptyCondition(query)) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: entity view condition is empty.',
    });
  }

  const targets = await query.limit(2).getMany();

  // catch attempting view multiple entities or nothing
  if (targets.length > 1) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: entity condition invalid.',
      payload: { count: targets.length },
    });
  }

  if (targets.length === 0) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.ENTITY_NOT_FOUND,
      status: 404,
      message: 'Error: entity not found.',
    });
  }

  return targets[0];
};

/**
 * Default handler for update entity
 *
 * fields - should be without primary keys (e.g. this is do it in CRUD.update)
 */
const updateDefaultHandler = async <TEntity>(
  query: SelectQueryBuilder<TEntity>,
  fields: Partial<TEntity>,
  repository: ICrudParams<TEntity>['repository'],
): Promise<TEntity> => {
  // catch attempting pass empty fields for update
  if (Object.keys(fields).length === 0) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: validation failed for entity, empty fields.',
    });
  }

  const target = await viewDefaultHandler(query);
  const result = Object.assign(target, fields);
  const errors = (await validate(result, { whitelist: true, forbidNonWhitelisted: true })).map(
    ({ value, property, constraints }) => ({ value, property, constraints }),
  );

  if (errors.length > 0) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: validation failed for entity, invalid fields.',
      payload: errors,
    });
  }

  try {
    return await repository.save(result);
  } catch (e) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.FAILED_UPDATE,
      status: 500,
      message: e.message,
    });
  }
};

/**
 * Default handler for remove entity(ies)
 */
const removeDefaultHandler = async <TEntity>(
  repository: ICrudParams<TEntity>['repository'],
  query: SelectQueryBuilder<TEntity>,
  {
    isAllowMultiple,
    isSoftDelete,
  }: Pick<IRemoveParams<TEntity>, 'isSoftDelete' | 'isAllowMultiple'>,
): Promise<IRemoveResult<TEntity>> => {
  if (hasEmptyCondition(query)) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: entity remove condition is empty.',
    });
  }

  const primaryKeys = new Set(
    repository.metadata.primaryColumns.map(({ propertyName }) => propertyName),
  );

  try {
    const entities = await query.getMany();

    if (entities.length === 0) {
      throw new BaseException({
        code: CRUD_EXCEPTION_CODE.ENTITY_NOT_FOUND,
        status: 404,
        message: 'Error: entity not found.',
      });
    }

    if (!isAllowMultiple && entities.length > 1) {
      throw new BaseException({
        code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
        status: 422,
        message: 'Error: you can remove only one entity at a time.',
      });
    }

    // keep only primary keys
    const deleted = entities.map((entity) =>
      Object.entries(entity).reduce((res, [field, value]) => {
        if (!primaryKeys.has(field)) {
          return res;
        }

        return {
          ...res,
          [field]: value,
        };
      }, {}),
    );

    if (isSoftDelete) {
      await repository.softRemove(entities);
    } else {
      await repository.remove(entities);
    }

    return { deleted };
  } catch (e) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.FAILED_DELETE,
      status: 500,
      message: e.message,
    });
  }
};

/**
 * Default handler for restore entity(ies)
 */
const restoreDefaultHandler = async <TEntity>(
  repository: ICrudParams<TEntity>['repository'],
  query: SelectQueryBuilder<TEntity>,
  isAllowMultiple: boolean,
): Promise<IRestoreResult<TEntity>> => {
  if (hasEmptyCondition(query)) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
      status: 422,
      message: 'Error: entity restore condition is empty.',
    });
  }

  try {
    const entities = await query.getMany();

    if (entities.length === 0) {
      throw new BaseException({
        code: CRUD_EXCEPTION_CODE.ENTITY_NOT_FOUND,
        status: 404,
        message: 'Error: entity not found for restore.',
      });
    }

    if (!isAllowMultiple && entities.length > 1) {
      throw new BaseException({
        code: CRUD_EXCEPTION_CODE.VALIDATION_FAILED,
        status: 422,
        message: 'Error: you can restore only one entity at a time.',
      });
    }

    return { restored: await repository.recover(entities) };
  } catch (e) {
    throw new BaseException({
      code: CRUD_EXCEPTION_CODE.FAILED_RESTORE,
      status: 500,
      message: e.message,
    });
  }
};

/**
 * Create typeorm json query instance and pass to operation handler
 */
class CRUD {
  static defaultHandler = {
    count: getQueryCount,
    list: getQueryList,
    view: viewDefaultHandler,
    create: createDefaultHandler,
    update: updateDefaultHandler,
    remove: removeDefaultHandler,
    restore: restoreDefaultHandler,
  };

  /**
   * Create CRUD endpoints (controller) for given entity
   */
  static controller<TEntity>(
    repository: () => Repository<TEntity>,
    methods: Partial<IControllerMethodsParams<TEntity>> = {},
  ): Partial<IControllerReturn<TEntity>> {
    return Object.keys(this.defaultHandler).reduce(
      (res, endpoint: keyof IControllerMethodsParams<TEntity>) => {
        const method = methods[endpoint];
        const { path = endpoint, options = undefined } = typeof method === 'object' ? method : {};

        return {
          ...res,
          ...(method !== false
            ? {
                [path]: CRUD[endpoint](() => ({
                  repository: repository(),
                  ...options?.(),
                })),
              }
            : {}),
        };
      },
      {},
    );
  }

  /**
   * Count operation
   */
  static count<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TResult = Record<string, any>,
    TEntity = ObjectLiteral,
  >(
    countOptions: TOptions<ICountParams<TEntity>>,
    handler: ICrudHandler<
      TParams,
      TPayload,
      TResult,
      TEntity,
      ICountLazyResult<TEntity>
    > = defaultHandler,
  ): TCountReturn<TEntity, TParams, TPayload, TResult> {
    return async (params, options) => {
      const { repository, queryOptions } = countOptions();
      const typeQuery = createTypeQuery(repository.createQueryBuilder(), params, {
        ...queryOptions,
        isDisableOrderBy: true,
        isDisableAttributes: true,
      });
      const result = await handler(typeQuery, params, options);
      const { hasRemoved } = params;

      if (result instanceof TypeormJsonQuery) {
        return this.defaultHandler.count(result.toQuery(), hasRemoved);
      }

      if (result instanceof SelectQueryBuilder) {
        return this.defaultHandler.count(result, hasRemoved);
      }

      const { query, count, ...payload } = result;

      if (query instanceof TypeormJsonQuery) {
        return { ...(await this.defaultHandler.count(query.toQuery(), hasRemoved)), ...payload };
      }

      if (query instanceof SelectQueryBuilder) {
        return { ...(await this.defaultHandler.count(query, hasRemoved)), ...payload };
      }

      return { count, ...payload };
    };
  }

  /**
   * List operation
   */
  static list<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TResult = Record<string, any>,
    TEntity = ObjectLiteral,
  >(
    listOptions: TOptions<IListParams<TEntity>>,
    handler: ICrudHandler<TParams, TPayload, TResult, TEntity> = defaultHandler,
  ): TListReturn<TEntity, TParams, TPayload, TResult> {
    return async (params, options) => {
      const { repository, queryOptions, isListWithCount = true } = listOptions();
      const typeQuery = createTypeQuery(repository.createQueryBuilder(), params, queryOptions);
      const result = await handler(typeQuery, params, options);
      const { hasRemoved } = params;

      if (result instanceof TypeormJsonQuery) {
        return this.defaultHandler.list(result.toQuery(), isListWithCount, hasRemoved);
      }

      if (result instanceof SelectQueryBuilder) {
        return this.defaultHandler.list(result, isListWithCount, hasRemoved);
      }

      const { query, list, ...payload } = result;

      if (query instanceof TypeormJsonQuery && !list) {
        return {
          ...(await this.defaultHandler.list(query.toQuery(), isListWithCount, hasRemoved)),
          ...payload,
        };
      }

      if (query instanceof SelectQueryBuilder && !list) {
        return {
          ...(await this.defaultHandler.list(query, isListWithCount, hasRemoved)),
          ...payload,
        };
      }

      // responsibility on the developer (custom handler realisation)
      if (!list) {
        throw new Error('Internal error: property "list" should be returned from method.');
      }

      if (isListWithCount && typeof payload.count !== 'number') {
        throw new Error('Internal error: property "count" should be returned from method.');
      }

      return { list, ...payload };
    };
  }

  /**
   * View operation
   */
  static view<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TEntity = ObjectLiteral,
    TResult = TEntity,
  >(
    viewOptions: TOptions<IViewParams<TEntity>>,
    handler: ICrudHandler<
      TParams,
      TPayload,
      TResult,
      TEntity,
      IViewLazyResult<TEntity>
    > = defaultHandler,
  ): TViewReturn<TEntity, TParams, TPayload, TResult> {
    return async (params, options) => {
      const { repository, queryOptions } = viewOptions();
      const typeQuery = createTypeQuery(repository.createQueryBuilder(), params, {
        ...queryOptions,
        isDisableOrderBy: true,
        isDisablePagination: true,
      });
      const result = await handler(typeQuery, params, options);

      if (result instanceof TypeormJsonQuery) {
        return this.defaultHandler.view(result.toQuery());
      }

      if (result instanceof SelectQueryBuilder) {
        return this.defaultHandler.view(result);
      }

      return result;
    };
  }

  /**
   * Create operation
   */
  static create<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TEntity = ObjectLiteral,
    TResult = TEntity,
  >(
    createOptions: TOptions<ICreateParams<TEntity>>,
    handler: ICrudEntityHandler<TParams, TPayload, TResult, TEntity> = null,
  ): TCreateReturn<TEntity, TParams, TPayload, TResult> {
    return (params, options) => {
      const { repository, isAllowMultiple } = createOptions();
      const { fields } = params ?? {};

      if (handler) {
        return handler(fields, params, options);
      }

      return this.defaultHandler.create({ fields, repository, isAllowMultiple });
    };
  }

  /**
   * Update operation
   */
  static update<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TEntity = ObjectLiteral,
    TResult = TEntity,
  >(
    updateOptions: TOptions<IUpdateParams<TEntity>>,
    handler: ICrudUpdateHandler<TParams, TPayload, TResult, TEntity> = defaultHandler,
  ): TUpdateReturn<TEntity, TParams, TPayload, TResult> {
    return async (params, options) => {
      const { repository, queryOptions } = updateOptions();
      const typeQuery = createTypeQuery(repository.createQueryBuilder(), params, {
        ...queryOptions,
        isDisableRelations: true,
        isDisableOrderBy: true,
        isDisablePagination: true,
        isDisableAttributes: true,
      });
      const primaryKeys = new Set(
        repository.metadata.primaryColumns.map(({ propertyName }) => propertyName),
      );
      const fields = Object.entries(params.fields ?? {}).reduce((res, [field, value]) => {
        // exclude primary fields from request
        if (primaryKeys.has(field)) {
          return res;
        }

        return {
          ...res,
          [field]: value,
        };
      }, {});
      const result = await handler(typeQuery, fields, params, options);

      if (!result) {
        throw new BaseException({
          code: CRUD_EXCEPTION_CODE.FAILED_INSERT,
          status: 500,
          message: 'Failed to update entity: no entity found within the given criteria.',
        });
      }

      if (result instanceof TypeormJsonQuery) {
        return this.defaultHandler.update(result.toQuery(), fields, repository);
      }

      if (result instanceof SelectQueryBuilder) {
        return this.defaultHandler.update(result, fields, repository);
      }

      const { query, fields: updatedFields, result: entity } = result;

      if (query instanceof TypeormJsonQuery) {
        return this.defaultHandler.update(query.toQuery(), updatedFields ?? fields, repository);
      }

      if (query instanceof SelectQueryBuilder) {
        return this.defaultHandler.update(query, updatedFields ?? fields, repository);
      }

      return entity;
    };
  }

  /**
   * Delete operation
   */
  static remove<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TEntity = ObjectLiteral,
    TResult = IRemoveResult<TEntity>,
  >(
    deleteOptions: TOptions<IRemoveParams<TEntity>>,
    handler: ICrudHandler<
      TParams,
      TPayload,
      TResult,
      TEntity,
      IRemoveLazyResult<TEntity>
    > = defaultHandler,
  ): TRemoveReturn<TEntity, TParams, TPayload> {
    return async (params, options) => {
      const {
        repository,
        isAllowMultiple = true,
        isSoftDelete = false,
        queryOptions,
      } = deleteOptions();
      const typeQuery = createTypeQuery(repository.createQueryBuilder(), params, {
        ...queryOptions,
        isDisableRelations: true,
        isDisableOrderBy: true,
        isDisableAttributes: true,
        isDisablePagination: true,
      });
      const result = await handler(typeQuery, params, options);

      if (result instanceof TypeormJsonQuery) {
        return this.defaultHandler.remove(repository, result.toQuery(), {
          isAllowMultiple,
          isSoftDelete,
        });
      }

      if (result instanceof SelectQueryBuilder) {
        return this.defaultHandler.remove(repository, result, { isAllowMultiple, isSoftDelete });
      }

      return result;
    };
  }

  /**
   * Restore operation
   */
  static restore<
    TParams = Record<string, any>,
    TPayload = Record<string, any>,
    TEntity = ObjectLiteral,
    TResult = IRestoreResult<TEntity>,
  >(
    restoreOptions: TOptions<IRestoreParams<TEntity>>,
    handler: ICrudHandler<
      TParams,
      TPayload,
      TResult,
      TEntity,
      IRestoreLazyResult<TEntity>
    > = defaultHandler,
  ): TRestoreReturn<TEntity, TParams, TPayload> {
    return async (params, options) => {
      const { repository, isAllowMultiple = true, queryOptions } = restoreOptions();
      const typeQuery = createTypeQuery(repository.createQueryBuilder(), params, {
        ...queryOptions,
        isDisableRelations: true,
        isDisableOrderBy: true,
        isDisableAttributes: true,
        isDisablePagination: true,
      });
      const result = await handler(typeQuery, params, options);

      if (result instanceof TypeormJsonQuery) {
        return this.defaultHandler.restore(repository, result.toQuery(), isAllowMultiple);
      }

      if (result instanceof SelectQueryBuilder) {
        return this.defaultHandler.restore(repository, result, isAllowMultiple);
      }

      return result;
    };
  }
}

export default CRUD;

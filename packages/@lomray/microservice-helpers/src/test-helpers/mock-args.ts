import type { IEndpointOptions } from '@lomray/microservice-nodejs-lib';
import type { ICountResult, IRemoveResult, IListResult, IRestoreResult } from '@services/crud';

// @ts-ignore
const endpointOptions: IEndpointOptions = { app: {}, req: {} };
const listResult = (): IListResult<Record<string, any>> => ({ list: [], count: 0 });
const countResult = (): ICountResult<Record<string, any>> => ({ count: 0 });
const removeResult = (res: Record<string, any>[] = []): IRemoveResult<Record<string, any>> => ({
  deleted: res,
});
const restoreResult = (res: Record<string, any>[] = []): IRestoreResult<Record<string, any>> => ({
  restored: res,
});

const shouldNotCall = "This is shouldn't calls.";

export { countResult, listResult, removeResult, restoreResult, endpointOptions, shouldNotCall };

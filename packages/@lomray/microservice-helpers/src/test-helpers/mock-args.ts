import type { IEndpointOptions } from '@lomray/microservice-nodejs-lib';
import type {
  CountOutputParams,
  RemoveOutputParams,
  ListOutputParams,
  RestoreOutputParams,
} from '@services/endpoint';

// @ts-ignore
const endpointOptions: IEndpointOptions = { app: { msInstanceMock: true }, req: {} };
const listResult = (): ListOutputParams<Record<string, any>> => ({ list: [], count: 0 });
const countResult = (): CountOutputParams => ({ count: 0 });
const removeResult = (
  res: Record<string, any>[] = [],
): RemoveOutputParams<Record<string, any>> => ({
  deleted: res,
});
const restoreResult = (
  res: Record<string, any>[] = [],
): RestoreOutputParams<Record<string, any>> => ({
  restored: res,
});

const shouldNotCall = "This is shouldn't calls.";

export { countResult, listResult, removeResult, restoreResult, endpointOptions, shouldNotCall };

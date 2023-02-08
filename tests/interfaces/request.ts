import type { IMicroserviceResponse } from '@lomray/microservices-types';
import type { IApiClientReqOptions } from '@helpers/api/client';

export type TRequest = (
  params?: any,
  options?: IApiClientReqOptions,
) => Promise<IMicroserviceResponse>;

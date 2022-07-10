import {
  Endpoint,
  IJsonQueryFilter,
  IsNullable,
  IsUndefinable,
} from '@lomray/microservice-helpers';
import type { IJsonQuery } from '@lomray/microservices-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsObject, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { FilterType } from '@constants/filter';
import EndpointHandler from '@services/endpoint-handler';

class EndpointEnforceInput {
  @IsUndefinable()
  @IsNullable()
  @IsString()
  userId?: string | null;

  @IsString()
  method: string;

  @IsObject()
  @IsUndefinable()
  filterInput?: Record<string, any>;

  @JSONSchema({
    description: 'Should throw error in case if method not allowed. Default: true',
  })
  @IsBoolean()
  @IsUndefinable()
  shouldThrowError?: boolean;

  @JSONSchema({
    description: 'Run enforce and return method filters. Default: true',
  })
  @IsBoolean()
  @IsUndefinable()
  hasFilters?: boolean;

  @JSONSchema({
    description: 'Run enforce and check access by condition if exist. Default: true',
  })
  @IsBoolean()
  @IsUndefinable()
  hasCondition?: boolean;
}

class EndpointEnforceOutput {
  @IsBoolean()
  isAllow: boolean;

  @IsArray()
  roles: string[];

  @IsObject()
  @IsUndefinable()
  @Type(() => IJsonQueryFilter)
  filters?: IJsonQuery;

  @IsObject()
  @IsUndefinable()
  filteredInput?: Record<string, any>;
}

/**
 * Check access user to microservice method.
 * Also can:
 *  - return method filters.
 *  - filter input params (req params).
 */
const enforce = Endpoint.custom(
  () => ({
    input: EndpointEnforceInput,
    output: EndpointEnforceOutput,
    description:
      'Check access user to microservice method, filter req params, get entities filters',
  }),
  async (
    {
      userId,
      method,
      filterInput,
      payload,
      shouldThrowError = true,
      hasFilters = true,
      hasCondition = true,
    },
    { app },
  ) => {
    const hasFilterInput = Boolean(filterInput);
    const endpointService = EndpointHandler.init(method, {
      userId,
      hasFilters,
      hasFilterInput,
      hasCondition,
      hasFilterOutput: false,
      enforcerParams: {
        ms: app,
        templateParams: { payload, reqParams: filterInput },
      },
    });

    const isAllow = await endpointService.isMethodAllowed(shouldThrowError);
    const { roles } = await endpointService.getEnforcer().findUserRoles();

    return {
      isAllow,
      roles,
      filters:
        isAllow && hasFilters ? await endpointService.getMethodFilters(filterInput) : undefined,
      filteredInput:
        isAllow && hasFilterInput
          ? await endpointService.filterFields(FilterType.IN, filterInput, { payload })
          : undefined,
    };
  },
);

export default enforce;

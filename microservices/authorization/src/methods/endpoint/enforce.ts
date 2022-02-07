import { Endpoint, IJsonQueryWhereFilter, IsUndefinable } from '@lomray/microservice-helpers';
import type { IJsonQueryWhere } from '@lomray/typeorm-json-query';
import { Type } from 'class-transformer';
import { IsBoolean, IsObject, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import EndpointHandler from '@services/endpoint-handler';
import { FilterType } from '@services/fields-filter';

class EndpointEnforceInput {
  @IsUndefinable()
  @IsString()
  userId?: string;

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
    description: 'Run enforce and collect method filters. Default: true',
  })
  @IsBoolean()
  @IsUndefinable()
  hasFilters?: boolean;
}

class EndpointEnforceOutput {
  @IsBoolean()
  isAllow: boolean;

  @IsObject()
  @IsUndefinable()
  @Type(() => IJsonQueryWhereFilter)
  filters?: IJsonQueryWhere;

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
  }),
  async ({ userId, method, filterInput, shouldThrowError = true, hasFilters = true }) => {
    const hasFilterInput = Boolean(filterInput);
    const endpointService = EndpointHandler.init(method, {
      userId,
      hasFilters,
      hasFilterInput,
      hasFilterOutput: false,
    });

    const isAllow = await endpointService.isMethodAllowed(shouldThrowError);

    return {
      isAllow,
      filters:
        isAllow && hasFilters ? await endpointService.getMethodFilters(filterInput) : undefined,
      filteredInput:
        isAllow && hasFilterInput
          ? await endpointService.filterFields(FilterType.IN, filterInput)
          : undefined,
    };
  },
);

export default enforce;

import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsArray, IsBoolean, IsObject, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { FilterType } from '@constants/filter';
import type Filter from '@entities/filter';
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
  filters?: Filter['condition'];

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
        templateParams: { payload, reqParams: filterInput, method },
      },
    });

    const isAllow = await endpointService.isMethodAllowed(shouldThrowError);
    const { roles } = await endpointService.getEnforcer().findUserRoles();

    const filters =
      isAllow && hasFilters ? await endpointService.getMethodFilters(filterInput) : undefined;
    const filterInputMethodOptions = filterInput?.payload?.authorization?.filter?.methodOptions;

    return {
      isAllow,
      roles,
      // If filters exists
      filters: filters && {
        ...filters,
        // Provide authorization filters if method filters doesn't exist
        ...(filterInputMethodOptions
          ? {
              methodOptions: {
                ...filters.methodOptions,
                // Method options for microservices helpers: Is allow distinct
                ...filterInputMethodOptions,
              },
            }
          : {}),
      },
      filteredInput:
        isAllow && hasFilterInput
          ? await endpointService.filterFields(FilterType.IN, app, filterInput, { payload, method })
          : undefined,
    };
  },
);

export default enforce;

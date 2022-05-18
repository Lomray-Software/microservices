import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsObject, IsString } from 'class-validator';
import { FilterType } from '@constants/filter';
import EndpointHandler from '@services/endpoint-handler';

class EndpointFilterInput {
  @IsUndefinable()
  @IsNullable()
  @IsString()
  userId?: string | null;

  @IsString()
  method: string;

  @IsEnum(FilterType)
  type: FilterType;

  @IsObject()
  @IsUndefinable()
  filterInput?: Record<string, any>;
}

class EndpointFilterOutput {
  @IsObject()
  @IsUndefinable()
  filtered: Record<string, any>;
}

/**
 * Filter input/output endpoint params
 */
const filter = Endpoint.custom(
  () => ({
    input: EndpointFilterInput,
    output: EndpointFilterOutput,
    description: 'Filter input/output endpoint params',
  }),
  async ({ userId, method, type, filterInput, payload }) => {
    const hasFilterInput = type === FilterType.IN;
    const endpointService = EndpointHandler.init(method, {
      userId,
      hasFilters: false,
      hasCondition: false,
      hasFilterInput,
      hasFilterOutput: !hasFilterInput,
    });

    return {
      filtered: await endpointService.filterFields(type, filterInput, { payload }),
    };
  },
);

export default filter;

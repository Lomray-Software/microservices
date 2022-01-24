import { Endpoint, IsUndefinable, IsType } from '@lomray/microservice-helpers';
import { IsEnum, IsObject, IsString } from 'class-validator';
import EndpointHandler from '@services/endpoint-handler';
import { FilterType } from '@services/fields-filter';

class EndpointFilterInput {
  @IsUndefinable()
  @IsType(['string', 'number'])
  userId?: string | number;

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
  }),
  async ({ userId, method, type, filterInput }) => {
    const hasFilterInput = type === FilterType.IN;
    const endpointService = EndpointHandler.init(method, {
      userId,
      hasFilters: false,
      hasFilterInput,
      hasFilterOutput: !hasFilterInput,
    });

    return {
      filtered: await endpointService.filterFields(type, filterInput),
    };
  },
);

export default filter;

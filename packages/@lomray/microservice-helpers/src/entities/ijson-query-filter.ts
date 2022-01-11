import type { IJsonQuery, IJsonQueryOrderField, IJsonQueryWhere } from '@lomray/typeorm-json-query';
import { ObjectLiteral, IJsonQueryOrder } from '@lomray/typeorm-json-query';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsObject, IsString, IsEmpty } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import IsUndefinable from '@validators/is-undefinable';

@JSONSchema({
  description: 'IJSON Query Ordering. You can use "exampleField" or "exampleField2" format.',
  example: { exampleField: 'DESC', exampleField2: { order: 'ASC' } },
})
class IJsonQueryOrderFilter {
  @IsEnum(IJsonQueryOrder)
  @IsUndefinable()
  exampleField?: keyof typeof IJsonQueryOrderFilter;

  @IsObject()
  @IsUndefinable()
  @JSONSchema({
    format: 'field: { order: "DESC", nulls: "last" }',
  })
  exampleField2?: IJsonQueryOrderField;
}

class IJsonQueryWhereFilter<TEntity> {
  @JSONSchema({
    description: 'Array of IJsonQueryWhereFilter',
    example: { and: [{ field: 1 }, { field: 2 }] },
  })
  @IsArray()
  @IsUndefinable()
  and?: IJsonQueryWhere<TEntity>[];

  @JSONSchema({
    description: 'Array of IJsonQueryWhereFilter',
    example: { or: [{ field: 1 }, { field: 2 }] },
  })
  @IsArray()
  @IsUndefinable()
  or?: IJsonQueryWhere<TEntity>[];

  @IsString()
  @IsUndefinable()
  field?: string;

  @IsNumber()
  @IsUndefinable()
  field2?: number;

  @IsEmpty()
  field3?: null;

  @JSONSchema({
    description: 'Not equal condition: !=',
    example: { field: { '!=': 5 } },
  })
  @IsObject()
  @IsUndefinable()
  field4?: null;

  @JSONSchema({
    description: 'Contains condition: in',
    example: { field: { in: [1, 2, 3] } },
  })
  @IsObject()
  @IsUndefinable()
  field5?: null;

  @JSONSchema({
    description: 'Not contains condition: !in',
    example: { field: { '!in': [1, 2, 3] } },
  })
  @IsObject()
  @IsUndefinable()
  field6?: null;

  @JSONSchema({
    description: 'Search string condition: like. % - pattern',
    example: { field: { like: '%hello%' } },
  })
  @IsObject()
  @IsUndefinable()
  field7?: null;

  @JSONSchema({
    description: 'Comparison condition: >, >=, <, <=',
    example: { field: { '<': 5, '>=': 2 } },
  })
  @IsObject()
  @IsUndefinable()
  field8?: null;

  @JSONSchema({
    description:
      'Between condition: between. You can pass additional option: isIncludes (for greedy comparison)',
    example: { field: { between: [1, 5] } },
  })
  @IsObject()
  @IsUndefinable()
  field9?: null;
}

class IJsonQueryFilter<TEntity = ObjectLiteral> implements IJsonQuery<TEntity> {
  @IsArray()
  @IsUndefinable()
  attributes?: IJsonQuery<TEntity>['attributes'];

  @IsNumber()
  @IsUndefinable()
  page?: IJsonQuery<TEntity>['page'];

  @IsNumber()
  @IsUndefinable()
  pageSize?: IJsonQuery<TEntity>['pageSize'];

  @IsObject()
  @IsUndefinable()
  @Type(() => IJsonQueryOrderFilter)
  orderBy?: IJsonQuery<TEntity>['orderBy'];

  @JSONSchema({
    description: 'It can be array of strings or { name: "relation-name", where: IJsonQueryWhere }',
    format: 'field: { order: "DESC", nulls: "last" }',
  })
  @IsArray()
  @IsUndefinable()
  relations?: IJsonQuery<TEntity>['relations'];

  @IsObject()
  @IsUndefinable()
  @Type(() => IJsonQueryWhereFilter)
  where?: IJsonQuery<TEntity>['where'];
}

export { IJsonQueryFilter, IJsonQueryWhereFilter, IJsonQueryOrderFilter };

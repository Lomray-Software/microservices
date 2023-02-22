import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import type { IJsonQuery } from '@lomray/microservices-types';
import type { ITypeormJsonQueryOptions } from '@lomray/typeorm-json-query';
import { Allow, Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { FilterIgnoreType } from '@constants/filter';
import MethodFilter from '@entities/method-filter';

@JSONSchema({
  properties: {
    filterMethods: { $ref: '#/definitions/MethodFilter', type: 'array' },
  },
})
@Entity()
class Filter {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Unique('filter(uq):title', ['title'])
  @Column({ type: 'varchar', length: 255 })
  @Length(3, 255)
  title: string;

  @JSONSchema({
    description:
      'Accept IJsonQuery, IJsonQueryOptions and method options. Template variables used only like this: "{{ userId }}". ' +
      'Available variables: fields - input data, userId, userRole. ' +
      'Available lodash template expressions.',
    examples: [
      {
        options: { maxPageSize: 200 },
        query: {
          where: { id: '{{ userId }}' },
        },
      },
      {
        query: {
          where: { userId: '{{ userId }}' },
        },
      },
      {
        methodOptions: {
          isAllowMultiple: true,
        },
      },
    ],
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  condition: {
    options?: Partial<ITypeormJsonQueryOptions>;
    query?: IJsonQuery;
    methodOptions?: {
      isAllowMultiple?: boolean;
      isSoftDelete?: boolean;
      isListWithCount?: boolean;
      isParallel?: boolean;
      shouldReturnEntity?: boolean;
      shouldResetCache?: boolean;
    };
  };

  @JSONSchema({
    description:
      'Roles to be ignored. stop - stop propagation, only - ignore only the specified role',
    example: { admin: 'stop', user: 'only' },
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  ignore: { [role: string]: FilterIgnoreType };

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MethodFilter, (methodFilter) => methodFilter.filter)
  filterMethods: MethodFilter[];
}

export default Filter;

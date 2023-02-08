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
      'Accept IJsonQuery and IJsonQueryOptions. Template variables used only like this: "{{ userId }}". Available variables: fields - input data, userId, userRole, timestamp, datetime }',
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
    ],
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  condition: { options?: Partial<ITypeormJsonQueryOptions>; query?: IJsonQuery };

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

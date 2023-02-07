import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IJsonQueryWhere } from '@lomray/microservices-types';
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
  @Column({ type: 'varchar', length: 50 })
  @Length(3, 50)
  title: string;

  @JSONSchema({
    description:
      'IJsonWhere condition. Template variables used only like this: "{{ userId }}". Available variables: fields - input data, userId, userRole, timestamp, datetime }',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  condition: IJsonQueryWhere;

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

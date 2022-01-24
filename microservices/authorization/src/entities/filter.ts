import { IsUndefinable } from '@lomray/microservice-helpers';
import { IJsonQueryWhere } from '@lomray/typeorm-json-query';
import { Allow, Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import MethodFilter from '@entities/method-filter';

@Entity()
class Filter {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  @Length(3, 30)
  title: string;

  @JSONSchema({
    description:
      'IJsonWhere condition. Template variables used only like this: "{{ userId }}". Available variables: fields - input data, userId, userRole, timestamp, datetime }',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  condition: IJsonQueryWhere;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MethodFilter, (methodFilter) => methodFilter.filter)
  filterMethods: MethodFilter[];
}

export default Filter;

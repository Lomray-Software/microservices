import { IsTypeormDate } from '@lomray/microservice-helpers';
import { Length, IsEnum, IsNumber } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { FilterOperator } from '@constants/filter';
import type Filter from '@entities/filter';
import type Method from '@entities/method';
import type Role from '@entities/role';

@JSONSchema({
  properties: {
    filter: { $ref: '#/definitions/Filter' },
    method: { $ref: '#/definitions/Method' },
    role: { $ref: '#/definitions/Role' },
  },
})
@Entity()
@Unique(['methodId', 'filterId', 'roleAlias'])
class MethodFilter {
  @Column()
  @PrimaryColumn()
  @IsNumber()
  methodId: number;

  @Column()
  @PrimaryColumn()
  @IsNumber()
  filterId: number;

  @Column({
    type: 'enum',
    enum: FilterOperator,
  })
  @IsEnum(FilterOperator)
  operator: string;

  @Column({ type: 'varchar', length: 30 })
  @Length(3, 30)
  roleAlias: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Filter', 'filterMethods', { onDelete: 'CASCADE' })
  filter: Filter;

  @ManyToOne('Method', 'methodFilters', { onDelete: 'CASCADE' })
  method: Method;

  @ManyToOne('Role', { onDelete: 'CASCADE' })
  role: Role;
}

export default MethodFilter;

import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length, IsNumber, IsArray, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import Condition from '@entities/condition';
import MethodFilter from '@entities/method-filter';
import Model from '@entities/model';

@JSONSchema({
  properties: {
    modelIn: { $ref: '#/definitions/Model' },
    modelOut: { $ref: '#/definitions/Model' },
    methodFilters: { $ref: '#/definitions/MethodFilter', type: 'array' },
  },
})
@Entity()
@Unique(['microservice', 'method'])
class Method {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Length(1, 50)
  @IsNullable()
  microservice: string;

  @Column({ type: 'varchar', length: 100 })
  @Length(5, 100)
  method: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  @IsString()
  @IsUndefinable()
  description: string;

  @JSONSchema({
    description: 'List of roles or userId who can be access to this method.',
    example: ['user', 'user-id-1'],
  })
  @Column({ type: 'text', array: true, default: {} })
  @IsArray()
  @IsUndefinable()
  allowGroup: string[];

  @JSONSchema({
    description: 'List of roles or userId who cannot access to this method.',
    example: ['user-id-2', 'user-id-3'],
  })
  @Column({ type: 'text', array: true, default: {} })
  @IsArray()
  @IsUndefinable()
  denyGroup: string[];

  @Column({ type: 'integer', nullable: true, default: null })
  @IsNumber()
  @IsNullable()
  @IsUndefinable()
  modelInId: number | null;

  @Column({ type: 'integer', nullable: true, default: null })
  @IsNumber()
  @IsNullable()
  @IsUndefinable()
  modelOutId: number | null;

  @Column({ type: 'integer', nullable: true, default: null })
  @IsNumber()
  @IsNullable()
  @IsUndefinable()
  conditionId: number | null;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Model, { onDelete: 'SET NULL' })
  modelIn: Model;

  @ManyToOne(() => Model, { onDelete: 'SET NULL' })
  modelOut: Model;

  @OneToMany(() => MethodFilter, (methodFilter) => methodFilter.method)
  methodFilters: MethodFilter[];

  @ManyToOne(() => Condition, { onDelete: 'SET NULL' })
  condition: Condition;
}

export default Method;

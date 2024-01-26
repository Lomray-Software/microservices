import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length } from 'class-validator';
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
import type Method from '@entities/method';
import type { IConditions } from '@services/condition-checker';

@JSONSchema({
  properties: {
    methods: { $ref: '#/definitions/Method', type: 'array' },
  },
})
@Entity()
class Condition {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Unique('condition(uq):title', ['title'])
  @Column({ type: 'varchar', length: 255 })
  @Length(3, 255)
  title: string;

  @JSONSchema({
    description: 'Condition workflow description',
  })
  @Column({ type: 'varchar', length: 255, default: '' })
  @Length(3, 255)
  @IsUndefinable()
  description: string;

  @JSONSchema({
    description: 'JSON condition for check access to methods',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  conditions: IConditions;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Method', 'condition')
  methods: Method[];
}

export default Condition;

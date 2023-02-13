import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import type { IInnerRequestParams } from '@lomray/microservice-nodejs-lib';
import { Allow, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type History from '@entities/history';

@Entity()
class Task {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column({ type: 'varchar', length: 50, default: 'node1' })
  @Length(1, 50)
  @IsUndefinable()
  nodeId: string;

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  rule: string;

  @Column({ type: 'varchar', length: 100 })
  @Length(1, 100)
  method: string;

  @JSONSchema({
    description: 'Request params and options',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  payload: {
    params?: Record<string, any>;
    options?: Partial<IInnerRequestParams>;
  };

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('History', 'task')
  historyRecords: History[];
}

export default Task;

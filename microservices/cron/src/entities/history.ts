import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsNumber, IsObject } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TaskStatus from '@constants/task-status';
import type Task from '@entities/task';

@Entity()
class History {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column()
  @IsNumber()
  taskId: number;

  @Column({
    type: 'enum',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  response: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @IsUndefinable()
  executionTime: number;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Task', 'historyRecords')
  task: Task;
}

export default History;

import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, Length, ValidateNested, Allow } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TaskMode from '@constants/task-mode';
import TaskStatus from '@constants/task-status';
import TaskType from '@constants/task-type';
import Message from '@entities/message';
import Notice from '@entities/notice';
import Recipient from '@entities/recipient';

interface IParams {
  lastErrorMessage?: string;
  [key: string]: any;
}

@JSONSchema({
  title: 'Task',
  properties: {
    notices: { $ref: '#/definitions/Notice', type: 'array' },
    messages: { $ref: '#/definitions/Message', type: 'array' },
    recipients: { $ref: '#/definitions/Recipient', type: 'array' },
  },
})
@Entity()
class Task {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'enum', enum: TaskType })
  @IsEnum(TaskType)
  type: TaskType;

  @JSONSchema({
    description: `Last target on which task process failed. Retry failed task process from this entity id. Can be presented as any id:
      entity id, page number and so on`,
    examples: ['0771fea0-cf98-4208-8dd6-a9288e9bdd73', '1'],
  })
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsUndefinable()
  @IsNullable()
  lastFailTargetId: string | null;

  @JSONSchema({
    description: 'Current task status',
  })
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.INIT })
  @IsEnum(TaskStatus)
  @IsUndefinable()
  status: TaskStatus;

  @JSONSchema({
    description: `Default - checks based on last target error. Full check up - checks all entities for each chunk.
      Case example: If whole backend will down and some tasks were not completed. You MUST run task in full check up mode for preventing
      duplicate notices, messages ans so on.
      Full check up mode - will take longer time for process all task requirements.`,
  })
  @Column({ type: 'enum', enum: TaskMode, default: TaskMode.DEFAULT })
  @IsEnum(TaskMode)
  @IsUndefinable()
  mode: TaskMode;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @IsTypeormDate()
  updatedAt: Date;

  @JSONSchema({
    description: 'Notice template and created from this task notices',
  })
  @OneToMany('Notice', 'task')
  @Type(() => Notice)
  @ValidateNested()
  @IsUndefinable()
  notices: Notice[];

  @JSONSchema({
    description: 'Message template and created from this task messages',
  })
  @OneToMany('Message', 'task')
  @Type(() => Message)
  @ValidateNested()
  @IsUndefinable()
  messages: Message[];

  @JSONSchema({
    description:
      'Recipient group that should receive task template entity (email message and so on)',
  })
  @OneToMany('Recipient', 'task')
  @Type(() => Recipient)
  @ValidateNested()
  @IsUndefinable()
  recipients: Recipient[];
}

export default Task;

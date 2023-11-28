import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, Length, ValidateNested, Allow } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TaskStatus from '@constants/task-status';
import TaskType from '@constants/task-type';
import Message from '@entities/message';
import Notice from '@entities/notice';

@JSONSchema({
  description: 'Task',
  properties: {
    notices: { $ref: '#/definitions/Notice', type: 'array' },
    messages: { $ref: '#/definitions/Messages', type: 'array' },
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
  @Column({ type: 'uuid', default: null })
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

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: Record<string, any>;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @IsTypeormDate()
  updatedAt: Date;

  @JSONSchema({
    description: 'Notice template id. That template will be used for users notify',
  })
  @OneToMany('Notice', 'task', { onDelete: 'CASCADE', cascade: ['remove'] })
  @Type(() => Notice)
  @ValidateNested()
  @IsUndefinable()
  @JoinColumn({ name: 'id', referencedColumnName: 'taskId' })
  notices: Notice[];

  @JSONSchema({
    description: 'Message template id. That template will be used for users notify',
  })
  @OneToMany('Message', 'task', { onDelete: 'CASCADE', cascade: ['remove'] })
  @Type(() => Message)
  @ValidateNested()
  @IsUndefinable()
  @JoinColumn({ name: 'id', referencedColumnName: 'taskId' })
  messages: Message[];
}

export default Task;

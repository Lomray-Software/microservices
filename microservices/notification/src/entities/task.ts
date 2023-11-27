import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, Length, ValidateNested, Allow } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TaskStatus from '@constants/task-status';
import TaskType from '@constants/task-type';
import Message from '@entities/message';
import Notice from '@entities/notice';

@Entity()
class Task {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'enum', enum: TaskType })
  @IsEnum(TaskType)
  type: TaskType;

  @JSONSchema({
    description:
      'Last entity on which task process failed. Retry failed task process from this entity id',
  })
  @Column({ type: 'uuid', default: null })
  @Length(1, 36)
  @IsUndefinable()
  @IsNullable()
  lastFailTargetEntityId: string | null;

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
  @OneToOne('Notice', 'task')
  @Type(() => Notice)
  @ValidateNested()
  @IsUndefinable()
  notice: Notice;

  @JSONSchema({
    description: 'Message template id. That template will be used for users notify',
  })
  @OneToOne('Message', 'task')
  @Type(() => Message)
  @ValidateNested()
  @IsUndefinable()
  message: Message;
}

export default Task;

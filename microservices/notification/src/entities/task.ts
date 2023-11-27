import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, Length, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import TaskStatus from '@constants/task-status';
import TaskType from '@constants/task-type';
import Message from '@entities/message';
import Notice from '@entities/notice';

@Entity()
class Task {
  @PrimaryGeneratedColumn('uuid')
  @Length(1, 36)
  id: string;

  @Column({ type: 'uuid' })
  @Length(1, 36)
  @IsUndefinable()
  messageId: string | null;

  @Column({ type: 'uuid' })
  @Length(1, 36)
  @IsUndefinable()
  noticeId: string | null;

  @Column({ type: 'enum', enum: TaskType })
  @IsEnum(TaskType)
  type: TaskType;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: Record<string, any>;

  @JSONSchema({
    description: 'Current task status',
  })
  @Column({ type: 'enum', enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;

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
  @JoinColumn({ name: 'noticeId' })
  @Type(() => Notice)
  @ValidateNested()
  notice: Notice;

  @JSONSchema({
    description: 'Message template id. That template will be used for users notify',
  })
  @OneToOne('Message', 'task')
  @JoinColumn({ name: 'messageId' })
  @Type(() => Message)
  @ValidateNested()
  message: Message;
}

export default Task;

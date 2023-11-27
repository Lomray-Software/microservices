import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsArray, IsEnum, IsObject, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import NotifyType from '@constants/notify-type';
import type Notice from '@entities/notice';
import Task from '@entities/task';
import type IAttachment from '@interfaces/message-attachment';

@Entity()
class Message {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column()
  @IsString()
  noticeId: string;

  @JSONSchema({
    description: 'Define message relation and notice as template for task',
  })
  @Column({ type: 'uuid', default: null })
  @Length(1, 36)
  @IsUndefinable()
  taskId: string | null;

  @Column({
    type: 'enum',
    enum: NotifyType,
  })
  @IsEnum(NotifyType)
  type: NotifyType;

  @Column({ type: 'varchar' })
  @Length(1, 255)
  from: string;

  @JSONSchema({
    description: 'It can be email, phone, userId',
  })
  @Column({ type: 'varchar' })
  @Length(1, 255)
  to: string;

  @Column({ type: 'varchar' })
  @Length(0, 255)
  @IsUndefinable()
  subject: string;

  @Column({ type: 'text' })
  @Length(1)
  text: string;

  @Column({ type: 'json', default: [] })
  @IsArray()
  @IsUndefinable()
  attachments: IAttachment[];

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: Record<string, any>;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Notice', 'messages', { onDelete: 'SET NULL' })
  @IsUndefinable()
  notice: Notice;

  @OneToOne('Task', 'message')
  @JoinColumn()
  task: Task;
}

export default Message;

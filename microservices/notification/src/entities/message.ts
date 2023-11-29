import { IsNullable, IsTypeormDate, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
import { Allow, IsArray, IsEnum, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import NotifyType from '@constants/notify-type';
import type Notice from '@entities/notice';
import Task from '@entities/task';
import type IAttachment from '@interfaces/message-attachment';

interface IParams {
  isTemplate?: boolean;
  [key: string]: any;
}

@JSONSchema({
  title: 'Message',
  description:
    'If message is template than it should not be sent as separate message. It should be used as template for task messages.',
  properties: {
    task: { $ref: '#/definitions/Task' },
  },
})
@Entity()
class Message {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'uuid', default: null })
  @Length(1, 36)
  @IsUndefinable()
  @IsNullable()
  noticeId: string | null;

  @JSONSchema({
    description: 'Define task relation and message as template for task',
  })
  @Column({ type: 'uuid', default: null })
  @Length(1, 36)
  @IsUndefinable()
  @IsNullable()
  taskId: string | null;

  @JSONSchema({
    description: 'Can be nullable if message presented as template.',
  })
  @Column({ type: 'varchar', default: null })
  @Length(1, 255)
  @IsValidate(Message, (e: Message) => !Message.isTemplate(e))
  from: string | null;

  @JSONSchema({
    description: `It can be email, phone, userId. Can be nullable if message presented as template. `,
  })
  @Column({ type: 'varchar', default: null })
  @Length(1, 255)
  @IsValidate(Message, (e: Message) => !Message.isTemplate(e))
  to: string | null;

  @Column({
    type: 'enum',
    enum: NotifyType,
  })
  @IsEnum(NotifyType)
  type: NotifyType;

  @Column({ type: 'varchar' })
  @Length(0, 255)
  @IsUndefinable()
  subject: string;

  @Column({ type: 'text' })
  @Length(1)
  text: string;

  @Column({ type: 'text', default: null })
  @Length(1)
  @IsUndefinable()
  @IsNullable()
  html: string | null;

  @Column({ type: 'json', default: [] })
  @IsArray()
  @IsUndefinable()
  attachments: IAttachment[];

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Notice', 'messages', { onDelete: 'SET NULL' })
  @IsUndefinable()
  notice: Notice;

  @ManyToOne('Task', 'messages', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'taskId', referencedColumnName: 'id' })
  @IsUndefinable()
  @IsObject()
  task: Task;

  /**
   * Check if message is template
   */
  public static isTemplate(message: Message): boolean {
    // Params can be not provided
    return Boolean(message?.params?.isTemplate);
  }
}

export default Message;

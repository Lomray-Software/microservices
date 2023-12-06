import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import Message from '@entities/message';
import Task from '@entities/task';

@JSONSchema({
  title: 'Recipient',
  description: 'Recipient entity',
  properties: {
    task: { $ref: '#/definitions/Task' },
    message: { $ref: '#/definitions/Message' },
  },
})
@Unique(['userId', 'taskId'])
@Entity()
class Recipient {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'uuid' })
  @Length(1, 36)
  userId: string;

  @Column({ type: 'uuid' })
  @Length(1, 36)
  @IsUndefinable()
  taskId: string;

  @Column({ type: 'uuid', default: null })
  @Length(1, 36)
  @IsUndefinable()
  @IsNullable()
  messageId: string | null;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Task', 'recipients', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId', referencedColumnName: 'id' })
  @IsUndefinable()
  @IsObject()
  task: Task;

  @OneToOne('Message', 'recipient')
  @JoinColumn({ name: 'messageId', referencedColumnName: 'id' })
  @IsUndefinable()
  @IsObject()
  message: Message;
}

export default Recipient;

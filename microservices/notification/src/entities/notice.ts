import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsBoolean, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type Message from '@entities/message';

@Entity()
class Notice {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar' })
  @Length(1, 50)
  type: string;

  @Index('IDX_notice_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId: string | null;

  @JSONSchema({
    description: 'Define task relation and notice as template for task',
  })
  @Column({ type: 'uuid', default: null })
  @JoinColumn()
  @Length(1, 36)
  @IsUndefinable()
  taskId: string | null;

  @Column({ type: 'varchar' })
  @Length(1, 255)
  title: string;

  @Column({ type: 'text' })
  @Length(1)
  @IsUndefinable()
  description: string;

  @Column('bool', { default: false })
  @IsBoolean()
  @IsUndefinable()
  isViewed: boolean;

  @Column('bool', { default: false })
  @IsBoolean()
  @IsUndefinable()
  isHidden: boolean;

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

  @OneToMany('Message', 'notice')
  messages: Message[];
}

export default Notice;

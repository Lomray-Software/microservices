import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsObject, Length } from 'class-validator';
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import NotifyType from '@constants/notify-type';

@Entity()
class Message {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({
    type: 'enum',
    enum: NotifyType,
  })
  @IsEnum(NotifyType)
  type: NotifyType;

  @Column({ type: 'varchar' })
  @Length(1, 255)
  from: string;

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

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: Record<string, any>;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;
}

export default Message;

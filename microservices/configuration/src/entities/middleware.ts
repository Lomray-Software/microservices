import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { MiddlewareType } from '@lomray/microservice-nodejs-lib';
import type {
  MiddlewareEntity,
  IRemoteMiddlewareReqParams,
} from '@lomray/microservice-remote-middleware';
import { Allow, IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['sender', 'senderMethod', 'target', 'targetMethod', 'type'])
class Middleware implements MiddlewareEntity {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  target: string;

  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  targetMethod: string;

  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  sender: string;

  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  senderMethod: string;

  @Column({
    type: 'enum',
    enum: MiddlewareType,
    default: MiddlewareType.request,
  })
  @IsEnum(MiddlewareType)
  type: MiddlewareType;

  @Column({ type: 'integer', default: 9 })
  @IsNumber()
  @IsUndefinable()
  order: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  @Length(0, 500)
  @IsUndefinable()
  description: string;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IRemoteMiddlewareReqParams;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Middleware;

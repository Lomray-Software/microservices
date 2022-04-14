import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  Column,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import IdProvider from '@constants/id-provider';
import type User from '@entities/user';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IProviderParams {}

@JSONSchema({
  properties: { user: { $ref: '#/definitions/User' } },
})
@Entity()
class IdentityProvider {
  @PrimaryColumn()
  @Allow()
  userId: string;

  @Column({
    type: 'enum',
    enum: IdProvider,
  })
  @IsEnum(IdProvider)
  provider: IdProvider;

  @Column({ type: 'varchar', length: 70 })
  @Length(5, 70)
  identifier: string;

  @JSONSchema({
    description: 'Concrete provider in case with firebase: google, apple, etc...',
  })
  @Column({ type: 'varchar', length: 20, default: null })
  @Length(1, 20)
  @IsUndefinable()
  @IsNullable()
  type: string | null;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IProviderParams;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @IsTypeormDate()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne('User', 'identityProviders')
  @JoinColumn()
  user: User;
}

export default IdentityProvider;

import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length, IsEmail, IsMobilePhone, IsString, Matches } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import type IdentityProvider from '@entities/identity-provider';
import type Profile from '@entities/profile';

@JSONSchema({
  properties: {
    profile: { $ref: '#/definitions/Profile' },
    identityProviders: { $ref: '#/definitions/IdentityProvider', type: 'array' },
  },
})
@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 50, default: null, unique: true })
  @Length(1, 70)
  @Matches(/^[a-z0-9_.]+$/, {
    message: 'Username must be lower case and contains only: letters numbers _ .',
  })
  @IsUndefinable()
  username: string;

  @Column({ type: 'varchar', length: 25 })
  @Length(1, 25)
  firstName: string;

  @Column({ type: 'varchar', length: 25, default: '' })
  @Length(0, 25)
  @IsUndefinable()
  lastName: string;

  @Column({ type: 'varchar', length: 25, default: '' })
  @Length(0, 25)
  @IsUndefinable()
  middleName: string;

  @JSONSchema({
    description: 'This field should be changed though special method (e.g.: change-login).',
  })
  @Column({ type: 'varchar', length: 70, default: null, unique: true })
  @Length(1, 70)
  @IsEmail()
  @IsUndefinable()
  @IsNullable()
  email: string | null;

  @JSONSchema({
    description: 'This field should be changed though special method (e.g.: change-login).',
  })
  @Column({ type: 'varchar', length: 20, default: null, unique: true })
  @Length(1, 20)
  @IsMobilePhone()
  @IsUndefinable()
  @IsNullable()
  phone: string | null;

  @JSONSchema({
    description: 'This field should be changed though special method (e.g.: change-password).',
  })
  @Column({ type: 'varchar', select: false, default: null })
  @IsUndefinable()
  @IsNullable()
  @IsString()
  password: null | string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @IsTypeormDate()
  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToOne('Profile', 'user')
  profile: Profile;

  @OneToMany('IdentityProvider', 'user')
  identityProviders: IdentityProvider[];
}

export default User;

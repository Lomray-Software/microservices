import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length, IsEmail, IsMobilePhone, IsString } from 'class-validator';
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
import IdentityProvider from '@entities/identity-provider';
import Profile from '@entities/profile';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 25 })
  @Length(1, 25)
  firstName: string;

  @Column({ type: 'varchar', length: 25, default: '' })
  @Length(1, 25)
  @IsUndefinable()
  lastName: string;

  @Column({ type: 'varchar', length: 25, default: '' })
  @Length(1, 25)
  @IsUndefinable()
  middleName: string;

  @JSONSchema({
    description: 'This field should be changed though special method (e.g.: change-login).',
  })
  @Column({ type: 'varchar', length: 50, default: null, unique: true })
  @Length(1, 70)
  @IsEmail()
  @IsUndefinable()
  @IsNullable()
  email: string | null;

  @JSONSchema({
    description: 'This field should be changed though special method (e.g.: change-login).',
  })
  @Column({ type: 'varchar', length: 20, default: null, unique: true })
  @Length(1, 70)
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => IdentityProvider, (idProvider) => idProvider.user)
  identityProviders: IdentityProvider[];
}

export default User;

import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsISO8601, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import Gender from '@constants/gender';
import type User from '@entities/user';

export interface IProfileParams {
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

@JSONSchema({
  properties: { user: { $ref: '#/definitions/User' } },
})
@Entity()
class Profile {
  @PrimaryColumn()
  @Allow()
  userId: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.NOT_KNOWN,
  })
  @IsEnum(Gender)
  @IsUndefinable()
  gender: string;

  @Column({ type: 'date', default: null })
  @IsISO8601() // date yyyy-mm-dd
  @IsNullable()
  @IsUndefinable()
  birthDay: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  @Length(1, 255)
  @IsNullable()
  @IsUndefinable()
  photo: null | string;

  @Column({ type: 'varchar', length: 255, default: null })
  @Length(1, 255)
  @IsNullable()
  @IsUndefinable()
  location: null | string;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IProfileParams;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @IsTypeormDate()
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne('User', 'profile')
  @JoinColumn()
  user: User;
}

export default Profile;

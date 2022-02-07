import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsISO8601, IsObject, Length } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import User from '@entities/user';

export enum Gender {
  NOT_KNOWN = 'notKnown',
  MALE = 'male',
  FEMALE = 'female',
  NOT_SPECIFIED = 'notSpecified',
}

export interface IProfileParams {
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

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

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IProfileParams;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}

export default Profile;

import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Entity, Column, CreateDateColumn, Index, UpdateDateColumn, PrimaryColumn } from 'typeorm';

@JSONSchema({
  title: 'FCM Token',
})
@Entity()
class FcmToken {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  @Length(1, 255)
  @IsString()
  token: string;

  @Index('IDX_fcm_token_userId', ['userId'])
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  @IsString()
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Length(1, 255)
  @IsString()
  @IsUndefinable()
  userAgent?: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @IsTypeormDate()
  updatedAt: Date;
}

export default FcmToken;

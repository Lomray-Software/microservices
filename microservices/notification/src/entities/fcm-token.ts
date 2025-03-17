import { IsTypeormDate } from '@lomray/microservice-helpers';
import { IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, Unique } from 'typeorm';

@JSONSchema({
  title: 'FCM Token',
})
@Entity()
class FcmToken {
  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  @IsString()
  @Unique(['token'])
  token: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  @Length(1, 36)
  @IsString()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  @IsString()
  @PrimaryColumn()
  userAgent: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @IsTypeormDate()
  updatedAt: Date;
}

export default FcmToken;

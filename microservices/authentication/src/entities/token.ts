import {
  IsNullable,
  IsTimestamp,
  IsTypeormDate,
  IsUndefinable,
} from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import TokenType from '@constants/token-type';

@Entity()
@Unique(['type', 'userId', 'personal', 'access'])
@Index(['personal'])
class Token {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  @IsEnum(TokenType)
  type: TokenType;

  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @Column({ type: 'varchar', length: 32, default: null })
  @IsNullable()
  @Length(1, 32)
  personal: string | null;

  @Column({ type: 'varchar', length: 1000, default: null })
  @IsNullable()
  @Length(1, 1000)
  access: string | null;

  @Column({ type: 'varchar', length: 1000, default: null })
  @IsNullable()
  @Length(1, 1000)
  refresh: string | null;

  @Column({ type: 'int', width: 10, default: null })
  @IsNullable()
  @IsUndefinable()
  @IsTimestamp()
  expirationAt: number | null;

  @JSONSchema({
    description: 'Some token data, like device type and etc.',
    example: {
      deviceType: 'ios',
      userAgent: '....',
    },
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: Record<string, any>;

  @JSONSchema({
    description: 'Some payload data for token.',
    example: {
      roles: ['user'],
    },
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  jwtPayload: Record<string, any>;

  @JSONSchema({
    description: 'Some user payload data included in tokens.',
    example: {
      pushNotificationToken: '....',
    },
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  userParams: Record<string, any>;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;
}

export default Token;

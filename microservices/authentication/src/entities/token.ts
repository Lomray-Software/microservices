import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsObject, IsRFC3339, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * Auth token types
 */
export enum TokenType {
  jwt = 'jwt',
  personal = 'personal',
}

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

  @Column({ type: 'varchar', length: 300, default: null })
  @IsNullable()
  @Length(1, 300)
  access: string | null;

  @Column({ type: 'varchar', length: 300, default: null })
  @IsNullable()
  @Length(1, 300)
  refresh: string | null;

  @Column('timestamp', { default: null })
  @IsNullable()
  @IsRFC3339() // timestamp validator
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

  @CreateDateColumn()
  createdAt: Date;
}

export default Token;

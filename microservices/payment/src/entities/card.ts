import { IsTypeormDate } from '@lomray/microservice-helpers';
import { IsBoolean, IsCreditCard, IsEnum, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
  Column,
  Unique,
  PrimaryColumn,
} from 'typeorm';
import CardType from '@constants/card-type';
import type Customer from '@entities/customer';
import IsCardExpirationValid from '@helpers/validators/is-card-expiration-valid';

/**
 * Card entity
 */
@JSONSchema({
  properties: {
    customer: { $ref: '#/definitions/Customer' },
  },
})
@Entity()
class Card {
  @JSONSchema({
    description: 'Field for storing id of according card entity',
    example: 'card_1N7zzsFpQjUWTpHeCrYKrCkR',
  })
  @PrimaryColumn({ type: 'varchar', length: 19 })
  @Length(1, 29)
  cardId: string;

  @Index('IDX_card_userId', ['userId'])
  @Column({ type: 'varchar', length: 36 })
  @Unique(['userId'])
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    example: '4242424242424242',
  })
  @Column({ type: 'string' })
  @IsCreditCard()
  @IsString()
  number: string;

  @JSONSchema({
    example: '01/27',
  })
  @Column({ type: 'string' })
  @IsCardExpirationValid()
  @IsString()
  expired: string;

  @Column({ type: 'string', length: 255 })
  @Length(1, 255)
  holderName: string;

  @JSONSchema({
    example: 'visa',
  })
  @Column({ type: 'enum', enum: CardType })
  @IsEnum(CardType)
  type: CardType;

  @JSONSchema({
    description: "If it's the first attached user card it should be default",
  })
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isDefault: boolean;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Customer', 'cards')
  @JoinColumn({ name: 'userId' })
  customer: Customer;
}

export default Card;

import { IsTypeormDate } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, Length } from 'class-validator';
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
import type Customer from '@entities/customer';
import IsCardExpirationValid from '@helpers/validators/is-card-expiration-valid';
import IsLastCardDititsValid from '@helpers/validators/is-last-card-digits-valid';

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
    description: 'Last 4 card digits',
    example: '4242',
  })
  @Column({ type: 'varchar' })
  @IsLastCardDititsValid()
  @IsString()
  lastDigits: string;

  @JSONSchema({
    example: '01/27',
  })
  @Column({ type: 'varchar', length: 5 })
  @IsCardExpirationValid()
  @Length(5, 5)
  expired: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  holderName: string;

  @JSONSchema({
    example: 'visa',
  })
  @Column({ type: 'varchar', length: 20 })
  type: string;

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

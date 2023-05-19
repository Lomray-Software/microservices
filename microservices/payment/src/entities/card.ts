import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsBoolean, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type Customer from '@entities/customer';
import IsCardExpirationValid from '@helpers/validators/is-card-expiration-valid';
import IsLastCardDigitsValid from '@helpers/validators/is-last-card-digits-valid';

/**
 * In case of stipe:
 * cardId - only have cards from connected account and
 * cards related to SetupIntent doesn't have own id
 * isExternalConnect - if card setup in connect account as external account
 * isApproved - is approved by payment provider
 */
export interface IParams {
  cardId?: string;
  isApproved?: boolean;
  isExternalConnect?: boolean;
}

/**
 * Card entity
 * NOTE: Stipe - should store both cards from connect account and from SetupIntent
 */
@JSONSchema({
  properties: {
    customer: { $ref: '#/definitions/Customer' },
  },
})
@Entity()
class Card {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Index('IDX_card_userId', ['userId'])
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    description: 'Last 4 digits',
    example: '4242',
  })
  @Column({ type: 'varchar', length: 4 })
  @IsLastCardDigitsValid()
  @Length(1, 4)
  lastDigits: string;

  @JSONSchema({
    example: '01/27',
  })
  @Column({ type: 'varchar', length: 5 })
  @IsCardExpirationValid()
  @Length(1, 5)
  expired: string;

  @Column({ type: 'varchar', length: 100, default: null })
  @IsUndefinable()
  @Length(1, 100)
  holderName: string | null;

  @JSONSchema({
    example: 'visa',
  })
  @Column({ type: 'varchar', length: 20 })
  @Length(1, 20)
  type: string;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @JSONSchema({
    description: "If it's the first attached user card it should be default",
  })
  @Column({ type: 'boolean', default: false })
  @IsUndefinable()
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

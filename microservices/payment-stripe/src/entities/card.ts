import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
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
import IsValidStripeId from '@helpers/validators/is-stripe-id-valid';

/**
 * Card params
 * @description
 * 1. Card with paymentMethodId (from setupIntent) uses for CHARGING specific
 * amount from user card without user manual approve
 * 2. Card with the cardId it's related to user connect account card for
 * ACCEPTING payments and money payout. Can't be used for money transfer
 * 3. Card can be default for connect account and for charge
 */
export interface IParams {
  // Only have cards from connected account and cards related to SetupIntent doesn't have own id
  cardId?: string;
  // Is approved by payment provider (setup is succeeded)
  isApproved?: boolean;
  // Setup intent id
  setupIntentId?: string;
  // @TODO: Remove. Retain for historical assistance
  paymentMethodId?: string;
  // Card issuer name
  issuer?: string | null;
}

/**
 * Card entity
 * @description Stipe should store both cards from connect account and from SetupIntent
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

  /**
   * Uses in client queries
   */
  @JSONSchema({
    description:
      'If payment method exist that Card can be charged and used in paymentIntent for processing payments. Attached to the customer, not connected account',
  })
  @Column({ type: 'varchar', length: 66, default: null })
  @IsValidStripeId()
  @Length(1, 66)
  @IsUndefinable()
  @IsNullable()
  paymentMethodId: string | null;

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

  /**
   * @TODO: add converter for stripe funding enum to funding type
   */
  @JSONSchema({
    example: 'debit',
    description: 'Uses in instant payouts: available only for debit cards',
  })
  @Column({ type: 'varchar', length: 10 })
  @Length(1, 10)
  funding: string;

  @JSONSchema({
    example: 'visa',
  })
  @Column({ type: 'varchar', length: 20 })
  @Length(1, 20)
  brand: string;

  @JSONSchema({
    description: 'Issuer country. Where issuer (e.g. bank) is registered',
    examples: ['US', 'BR'],
  })
  @Column({ type: 'varchar', length: 5, default: null })
  @Length(1, 5)
  @IsUndefinable()
  @IsNullable()
  origin: string | null;

  @JSONSchema({
    description: 'Billing country. Where holder (e.g. customer) is registered',
    examples: ['US', 'BR'],
  })
  @Column({ type: 'varchar', length: 5, default: null })
  @Length(1, 5)
  @IsUndefinable()
  @IsNullable()
  country: string | null;

  @JSONSchema({
    description: 'Billing postal code. Where holder (e.g. customer) is registered',
    examples: ['99301', '95076'],
  })
  @Column({ type: 'varchar', length: 10, default: null })
  @Length(1, 10)
  @IsUndefinable()
  @IsNullable()
  postalCode: string | null;

  @Column({ type: 'varchar', length: 100, default: null })
  @IsNullable()
  @IsUndefinable()
  @Length(1, 100)
  holderName: string | null;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  @IsUndefinable()
  isInstantPayoutAllowed: boolean;

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

  /**
   * Should be deleted cascade
   * NOTE: Uses in integration tests
   */
  @ManyToOne('Customer', 'cards', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  customer: Customer;
}

export default Card;

import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type StripeAccountTypes from '@constants/stripe-account-types';
import type BankAccount from '@entities/bank-account';
import type Card from '@entities/card';
import type Transaction from '@entities/transaction';
import type TCapabilitiesStatus from '@interfaces/capabilities-status';

export interface IParams {
  // Payment service account id
  accountType?: StripeAccountTypes;
  // Payment service account id
  accountId?: string;
  // Is user setup and verify payment data for accept payments
  isVerified?: boolean;
  // Connect account transfer capability status
  transferCapabilityStatus?: TCapabilitiesStatus;
  // Is allowed for init default payout
  isPayoutEnabled?: boolean;
  // If user have card that can be used for payment intent charges
  hasDefaultPaymentMethod?: boolean;
  // Used for contact platform with user connect account
  accountSupportPhoneNumber?: string | null;
}

@JSONSchema({
  properties: {
    transactions: { $ref: '#/definitions/Transaction', type: 'array' },
    cards: { $ref: '#/definitions/Card', type: 'array' },
    bankAccounts: { $ref: '#/definitions/BankAccount', type: 'array' },
  },
})
@Entity()
class Customer {
  @JSONSchema({
    example: 'cus_NZYV9mFrODGqkf',
  })
  @PrimaryColumn({ type: 'varchar', length: 18 })
  @Length(1, 18)
  customerId: string;

  @Column({ type: 'varchar', length: 36 })
  @Unique(['userId'])
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    description: 'Store data about stripe connected account and etc.',
    example: {
      accountId: 'acct_1LO435FpQjUWTpHe',
      isVerified: true,
    },
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Transaction', 'customer')
  transactions: Transaction[];

  @OneToMany('Card', 'customer')
  cards: Card[];

  @OneToMany('BankAccount', 'customer')
  bankAccounts: BankAccount[];
}

export default Customer;

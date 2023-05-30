import { IsUndefinable } from '@lomray/microservice-helpers';
import { Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import type StripeSdk from 'stripe';
import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import type BankAccount from '@entities/bank-account';
import type Card from '@entities/card';
import type Transaction from '@entities/transaction';

export interface IParams {
  // Payment service account id
  accountType?: StripeSdk.Account.Type;
  // Payment service account id
  accountId?: string;
  // Is user setup and verify payment data for accept payments
  isVerified?: boolean;
  // Connect account transfer capability status
  transferCapabilityStatus?: 'active' | 'inactive' | 'pending';
  // Is allowed for init default payout
  isPayoutEnabled?: boolean;
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

  @OneToMany('Transaction', 'customer')
  transactions: Transaction[];

  @OneToMany('Card', 'customer')
  cards: Card[];

  @OneToMany('BankAccount', 'customer')
  bankAccounts: BankAccount[];
}

export default Customer;

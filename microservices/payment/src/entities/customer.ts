import { IsUndefinable } from '@lomray/microservice-helpers';
import { Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import type Card from '@entities/card';
import type Transaction from '@entities/transaction';

/**
 * accountId - Payment service account id
 * isVerified - Is user setup and verify payment data for accept payments
 */
export interface ICustomerParams {
  accountId?: string;
  isVerified?: boolean;
}

@JSONSchema({
  properties: {
    transactions: { $ref: '#/definitions/Transaction', type: 'array' },
    cards: { $ref: '#/definitions/Card', type: 'array' },
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

  @Index('IDX_payment_userId', ['userId'])
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
  params: ICustomerParams;

  @OneToMany('Transaction', 'customer')
  transactions: Transaction[];

  @OneToMany('Card', 'customer')
  cards: Card[];
}

export default Customer;

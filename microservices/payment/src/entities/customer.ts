import { IsUndefinable } from '@lomray/microservice-helpers';
import { Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import Transaction from '@entities/transaction';

export interface ICustomerParams {
  accountId?: string;
}

@JSONSchema({
  properties: {
    transactions: { $ref: '#/definitions/Transactions', type: 'array' },
  },
})
@Entity()
class Customer {
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
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: ICustomerParams;

  @OneToMany('Transaction', 'customer')
  transactions: Transaction[];
}

export default Customer;

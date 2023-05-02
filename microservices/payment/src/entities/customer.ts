import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length, IsObject } from 'class-validator';
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
@Unique(['userId'])
class Customer {
  @PrimaryColumn({ type: 'varchar', length: 18 })
  @Allow()
  customerId: string;

  @Index('IDX_payment_userId', ['userId'])
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    description: 'Store data about stripe connected account and etc.',
  })
  @Column({ type: 'json', default: {} })
  @Allow()
  @IsObject()
  @IsUndefinable()
  params: ICustomerParams;

  @OneToMany('Transaction', 'customer')
  transactions: Transaction[];
}

export default Customer;

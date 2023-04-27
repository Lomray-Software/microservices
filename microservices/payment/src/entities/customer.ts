import { Allow, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import Transaction from '@entities/transaction';

@JSONSchema({
  properties: {
    transactions: { $ref: '#/definitions/Transactions', type: 'array' },
  },
})
@Entity()
class Customer {
  @PrimaryColumn({ type: 'varchar', length: 18 })
  @Allow()
  customerId: string;

  @Index('IDX_payment_userId', ['userId'])
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @OneToMany('Transaction', 'customer')
  transactions: Transaction[];
}

export default Customer;

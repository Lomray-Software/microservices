import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Customer from '@entities/customer';

@JSONSchema({
  properties: {
    customer: { $ref: '#/definitions/Customer' },
  },
})
@Entity()
class Transaction {
  @PrimaryColumn({ type: 'varchar', length: 66 })
  @Allow()
  transactionId: string;

  @Column({ type: 'varchar', length: 18 })
  @Allow()
  customerId: string;

  @Column({ type: 'varchar', length: 10 })
  @Allow()
  currency: string;

  @Column({ type: 'int' })
  @Allow()
  amount: number;

  @Column({ type: 'varchar', length: 18 })
  @Allow()
  @IsUndefinable()
  mode: string;

  @JSONSchema({
    description: 'Field for storing status of payment by the card or any other source',
  })
  @Column({ type: 'varchar', length: 18 })
  @Allow()
  @IsUndefinable()
  paymentStatus: string;

  @JSONSchema({
    description:
      'Field for storing status of process of transaction itself. E.g. checkout session is completed or in process',
  })
  @Column({ type: 'varchar', length: 18 })
  @Allow()
  @IsUndefinable()
  transactionStatus: string;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'customerId' })
  customer: Customer;
}

export default Transaction;

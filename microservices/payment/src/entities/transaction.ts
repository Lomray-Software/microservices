import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import PaymentIntentStatus from '@constants/payment-intent-status';
import TransactionType from '@constants/transaction-type';
import Customer from '@entities/customer';

@JSONSchema({
  properties: {
    customer: { $ref: '#/definitions/Customer' },
  },
})
@Entity()
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @PrimaryColumn({ type: 'varchar', length: 66 })
  @Allow()
  transactionId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsUndefinable()
  title: string;

  @Column({ type: 'varchar', length: 18 })
  @Allow()
  customerId: string;

  @Column({ type: 'varchar', length: 66 })
  @IsUndefinable()
  bankAccountId: string;

  @Column({ type: 'varchar', length: 66 })
  @IsUndefinable()
  cardId: string;

  @Column({ type: 'varchar', length: 32 })
  @IsUndefinable()
  entityId: string;

  @Column({ type: 'int' })
  @Allow()
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  @IsUndefinable()
  type: TransactionType;

  @Column({ type: 'int' })
  @IsUndefinable()
  tax: number;

  @Column({ type: 'int' })
  @IsUndefinable()
  fee: number;

  @JSONSchema({
    description: 'Field for storing status of payment by the card or any other source',
  })
  @Column({ type: 'enum', enum: PaymentIntentStatus })
  @IsEnum(PaymentIntentStatus)
  @IsUndefinable()
  status: PaymentIntentStatus;

  @JSONSchema({
    description:
      'Field for storing status of process of transaction itself. E.g. checkout session is completed or in process',
  })
  @Column({ type: 'varchar', length: 18 })
  @IsUndefinable()
  transactionStatus: string;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'customerId' })
  customer: Customer;
}

export default Transaction;

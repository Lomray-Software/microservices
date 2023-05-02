import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import TransactionStatus from '@constants/transaction-status';
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

  @Column({ type: 'varchar', length: 66 })
  @Allow()
  transactionId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsUndefinable()
  title: string;

  @Column({ type: 'varchar', length: 36 })
  @Allow()
  userId: string;

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
  @Column({ type: 'enum', enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  @IsUndefinable()
  status: TransactionStatus;

  @JSONSchema({
    description:
      'Field for storing status of process of transaction itself. E.g. checkout session is completed or in process',
  })
  @Column({ type: 'varchar', length: 18 })
  @IsUndefinable()
  transactionStatus: string;

  @Column({ type: 'varchar', length: 150 })
  @IsUndefinable()
  errorMessage: string;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'userId' })
  customer: Customer;
}

export default Transaction;

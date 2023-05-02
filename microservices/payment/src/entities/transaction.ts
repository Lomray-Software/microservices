import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsNumber, IsString, Length } from 'class-validator';
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
  @IsString()
  @Length(1, 66)
  transactionId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsUndefinable()
  @IsString()
  @Length(1, 100)
  title: string;

  @Column({ type: 'varchar', length: 36 })
  @IsString()
  @Length(1, 36)
  userId: string;

  @Column({ type: 'varchar', length: 66 })
  @IsUndefinable()
  @IsString()
  @Length(1, 66)
  bankAccountId: string;

  @Column({ type: 'varchar', length: 66 })
  @IsUndefinable()
  @IsString()
  @Length(1, 66)
  cardId: string;

  @Column({ type: 'varchar', length: 32 })
  @IsUndefinable()
  @IsString()
  @Length(1, 32)
  entityId: string;

  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  @IsUndefinable()
  type: TransactionType;

  @Column({ type: 'int' })
  @IsUndefinable()
  @IsNumber()
  tax: number;

  @Column({ type: 'int' })
  @IsUndefinable()
  @IsNumber()
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
  @IsString()
  @Length(1, 18)
  paymentStatus: string;

  @Column({ type: 'varchar', length: 150 })
  @IsUndefinable()
  @IsString()
  @Length(1, 150)
  errorMessage: string;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'userId' })
  customer: Customer;
}

export default Transaction;

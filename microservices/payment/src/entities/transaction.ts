import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import type Customer from '@entities/customer';
import type Product from '@entities/product';

export interface ITransactionParams {
  paymentStatus?: StripeTransactionStatus;
  checkoutStatus?: StripeCheckoutStatus;
  errorMessage?: string;
}

@JSONSchema({
  properties: {
    customer: { $ref: '#/definitions/Customer' },
    product: { $ref: '#/definitions/Product' },
  },
})
@Entity()
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 66 })
  @Length(1, 66)
  transactionId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsUndefinable()
  @Length(1, 100)
  title: string;

  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @Column({ type: 'varchar', length: 66 })
  @IsUndefinable()
  @Length(1, 66)
  bankAccountId: string;

  @Column({ type: 'varchar', length: 66 })
  @IsUndefinable()
  @Length(1, 66)
  cardId: string;

  @Column({ type: 'varchar', length: 32 })
  @IsUndefinable()
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
    description: 'Store data about payment connected account and etc.',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: ITransactionParams;

  @ManyToOne('Product', 'transactions')
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'userId' })
  customer: Customer;
}

export default Transaction;

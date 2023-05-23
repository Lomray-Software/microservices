import { IsNullable, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import type Customer from '@entities/customer';
import type Product from '@entities/product';
import IsValidStripeId from '@helpers/validators/is-stripe-id-valid';

export interface IParams {
  paymentStatus?: StripeTransactionStatus;
  checkoutStatus?: StripeCheckoutStatus;
  errorMessage?: string;
  // Payment method that was used to charge (e.g. pm_1N0vl32eZvKYlo2CiORpHAvo)
  paymentMethodId?: string;
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

  @Column({ type: 'varchar', length: 100, default: '' })
  @IsUndefinable()
  @Length(1, 100)
  title: string;

  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    example: 'ba_1NArBxFpQjUWTpHeyN22YIFw',
  })
  @Column({ type: 'varchar', length: 66, default: null })
  @IsValidStripeId()
  @Length(1, 66)
  @IsValidate(Transaction, (e) => !Transaction.isCardIdExist(e))
  bankAccountId: string | null;

  @JSONSchema({
    example: 'card_1NArBYFpQjUWTpHeFXcGACHa',
  })
  @Column({ type: 'varchar', length: 66, default: null })
  @IsValidStripeId()
  @Length(1, 66)
  @IsUndefinable()
  cardId: string | null;

  @JSONSchema({
    description: 'Microservice entity',
  })
  @Column({ type: 'varchar', length: 36 })
  @IsUndefinable()
  @Length(1, 36)
  entityId: string;

  @Column({ type: 'varchar', length: 19, default: null })
  @Length(1, 19)
  @IsUndefinable()
  @IsNullable()
  productId: string | null;

  @JSONSchema({ description: 'Unit amount (e.g. 100$ = 10000 in unit' })
  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  @IsUndefinable()
  type: TransactionType;

  @JSONSchema({
    description: 'Payment provider percent',
  })
  @Column({ type: 'int' })
  @IsUndefinable()
  @IsNumber()
  tax: number;

  @JSONSchema({
    description: 'Application percent',
  })
  @Column({ type: 'int' })
  @IsUndefinable()
  @IsNumber()
  fee: number;

  @JSONSchema({
    description: 'Field for storing status of payment by the card or any other source',
  })
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.INITIAL })
  @IsEnum(TransactionStatus)
  @IsUndefinable()
  status: TransactionStatus;

  @JSONSchema({
    description: 'Store data about payment connected account and etc.',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @ManyToOne('Product', 'transactions')
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'userId' })
  customer: Customer;

  /**
   * Check is cardId exist
   */
  public static isCardIdExist(entity: Transaction): boolean {
    return Boolean(entity.cardId);
  }
}

export default Transaction;

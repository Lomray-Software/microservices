import { IsTypeormDate, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionRole from '@constants/transaction-role';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import type Customer from '@entities/customer';
import type Product from '@entities/product';
import IsValidStripeId from '@helpers/validators/is-stripe-id-valid';
import type ITax from '@interfaces/tax';

export interface IComputedTax {
  taxId?: ITax['id'];
  taxTransactionAmountWithTaxUnit?: ITax['transactionAmountWithTaxUnit'];
  taxExpiresAt?: ITax['expiresAt'];
  taxCreatedAt?: ITax['createdAt'];
  taxTotalAmountUnit?: ITax['totalAmountUnit'];
  taxBehaviour?: ITax['behaviour'];
  taxFeeUnit?: number;
}

export interface IParams extends IComputedTax {
  paymentStatus?: StripeTransactionStatus;
  checkoutStatus?: StripeCheckoutStatus;
  errorMessage?: string;
  // Example: card_declined
  errorCode?: string;
  // Example: generic_decline
  declineCode?: string;
  // Application and stripe fees payer
  feesPayer?: TransactionRole;
  // PaymentIntent charge id, must exist for refund
  chargeId?: string;
  // Decomposed fees
  applicationFee?: number;
  paymentProviderFee?: number;
  extraFee?: number;
  extraRevenue?: number;
  // Amount that will charge for instant payout
  estimatedInstantPayoutFee?: number;
  // Original entity cost
  entityCost?: number;
  // Refunded amount
  refundedAmount?: number;
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

  @JSONSchema({
    description: 'Stripe transaction id (payment intent)',
    example: 'pi_3Nha3JAmQ4asS8PS0JPXIyEh',
  })
  @Column({ type: 'varchar', length: 66 })
  @Length(1, 66)
  transactionId: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  @IsUndefinable()
  @Length(1, 100)
  title: string;

  @JSONSchema({
    description: 'UserId from our microservice for user (customer) which pays (init transaction)',
  })
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  @IsUndefinable()
  type: TransactionType;

  @Column({ type: 'varchar', length: 66, default: null })
  @IsValidStripeId()
  @Length(1, 66)
  @IsUndefinable()
  bankAccountId: string | null;

  @Column({ type: 'varchar', length: 66, default: null })
  @IsValidStripeId()
  @Length(1, 66)
  @IsUndefinable()
  cardId: string | null;

  /**
   * Setup intent don't have card or bank account id
   */
  @JSONSchema({
    description: 'Payment method that was used to charge',
    example: 'pm_1N0vl32eZvKYlo2CiORpHAvo',
  })
  @Column({ type: 'varchar', length: 27, default: null })
  @IsValidStripeId()
  @Length(1, 27)
  @IsValidate(Transaction, (e) => !Transaction.isCardOrBankAccountExist(e))
  paymentMethodId: string | null;

  @JSONSchema({
    description: 'Microservice entity',
  })
  @Column({ type: 'varchar', length: 36 })
  @IsUndefinable()
  @Length(1, 36)
  entityId: string;

  @JSONSchema({ description: 'Unit amount (e.g. 100$ = 10000 in unit' })
  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

  @JSONSchema({
    description: 'Sales tax or other, that should be paid to the government by tax collector',
  })
  @Column({ type: 'int', default: 0 })
  @IsUndefinable()
  @IsNumber()
  tax: number;

  @JSONSchema({
    description: 'Fees: application, payment provider, etc..',
  })
  @Column({ type: 'int', default: 0 })
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

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Product', 'transactions')
  @JoinColumn({
    name: 'productId',
  })
  product: Product;

  @ManyToOne('Customer', 'transactions')
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'userId',
  })
  customer: Customer;

  /**
   * Check is cardId exist
   */
  public static isCardOrBankAccountExist(entity: Transaction): boolean {
    return Boolean(entity.cardId) || Boolean(entity.bankAccountId);
  }
}

export default Transaction;

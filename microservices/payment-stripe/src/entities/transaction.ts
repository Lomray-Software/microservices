import { IsNullable, IsTypeormDate, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
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
  totalTaxPercent?: ITax['totalTaxPercent'];
  taxFeeUnit?: number;
  autoCalculationFeeUnit?: number;
}

/**
 * Transaction params
 * @description Definitions:
 * 1. TransferId - Stripe object is created when you move funds between Stripe accounts as part of Connect. Needed for comprehending
 * the transaction state in situations involving the reversal of the full or partial transaction amount and refund with reversal.
 * For instance: py_1OFKUmPBMR5FbqzbQT2N5juH
 * 2. DestinationTransactionId - Stripe destination transaction id. Reference regarding the destination transaction on the connected account's side
 * For instance:  tr_3OFKatAmQ4asS8PS0GlS9dUr
 * 3. PersonalFee - Personal user fee. For receiver, it's application fees with only debit extra fees.
 *  For sender, it's application fees with only credit extra fees.
 */
export interface IParams extends IComputedTax {
  // Refunded original transaction/payment intent/charge
  refundedTransactionAmount: number;
  // Refunded Stripe collected fee
  refundedApplicationFeeAmount: number;
  // Transferred amount (e.g. via destination payment intent)
  transferAmount: number;
  // Reversed transaction amount from DESTINATION (e.g. connect account) to source (e.g. Platform)
  transferReversedAmount: number;
  // Platform account fee
  platformFee: number;
  // Stripe fee for processing transaction
  stripeFee: number;
  baseFee: number;
  extraFee: number;
  personalFee: number;
  destinationTransactionId?: string | null;
  transferId?: string | null;
  transferDestinationConnectAccountId?: string;
  paymentStatus?: StripeTransactionStatus;
  checkoutStatus?: StripeCheckoutStatus;
  errorMessage?: string;
  // Example: card_declined
  errorCode?: string;
  // Example: generic_decline
  declineCode?: string;
  // Stripe and platform fee payer
  feesPayer?: TransactionRole;
  extraRevenue?: number;
  // Amount that will charge for instant payout
  estimatedInstantPayoutFee?: number;
  // Original entity cost
  entityCost?: number;
}

/**
 * In whole cases this data is required and usable
 */
export const defaultParams: Pick<
  IParams,
  | 'refundedTransactionAmount'
  | 'refundedApplicationFeeAmount'
  | 'platformFee'
  | 'stripeFee'
  | 'extraFee'
  | 'baseFee'
  | 'personalFee'
  | 'transferAmount'
  | 'transferReversedAmount'
> = {
  refundedTransactionAmount: 0,
  refundedApplicationFeeAmount: 0,
  transferReversedAmount: 0,
  platformFee: 0,
  stripeFee: 0,
  extraFee: 0,
  baseFee: 0,
  personalFee: 0,
  transferAmount: 0,
};

@JSONSchema({
  description: `Transaction entity. Definitions: Application fees - collected amount by Platform from transaction.
    Tax - collected taxes (included in application fees).
    Fee - Platform fee, Stripe fee (included in application fees).
    Platform fee - fee that grab Platform as revenue from transaction.
    Stripe fee - fee that Stripe takes from processing transaction.
    Extra fee - apply to sender or/and receiver and included in transaction application fees, and in payment intent collected fees
    Base fee - platform + stripe + create tax transaction fee
    Personal fee - base fee + personal (debit or credit extra fee)
  `,
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

  @JSONSchema({
    description:
      'Represents a single attempt to move money into Platform Stripe account. Required for refunds, reversals, fees',
    example: 'ch_3OFZJjAmQ4asS8PS1l9MLI4v',
  })
  @Column({ type: 'varchar', length: 66, default: null })
  @Length(1, 66)
  @IsUndefinable()
  @IsNullable()
  chargeId: string | null;

  @JSONSchema({
    description: `Stripe payment intent application fee id. Contain Stripe fee, collected by application (platform) fee,
     tax. Transaction can be refunded with or without application fee: in this case for understanding
     NET transaction amount check application fee status (refunded or not) and amount`,
    example: 'fee_1OEqCzPBMR5FbqzbywqfYDwA',
  })
  @Column({ type: 'varchar', length: 66, default: null })
  @Length(1, 66)
  @IsUndefinable()
  @IsNullable()
  applicationFeeId: string | null;

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
  @IsNullable()
  cardId: string | null;

  /**
   * Setup intent don't have card or bank account id
   */
  @JSONSchema({
    description: `Payment method that was used to charge, for instance: card, bank account, etc.. Payment method is
     stripe entity that attached to customer`,
    example: 'pm_1N0vl32eZvKYlo2CiORpHAvo',
  })
  @Column({ type: 'varchar', length: 27, default: null })
  @IsValidStripeId()
  @Length(1, 27)
  @IsValidate(Transaction, (e) => !Transaction.isCardOrBankAccountExist(e))
  paymentMethodId: string | null;

  @JSONSchema({
    description: `Microservice entity. Single line item (ticket, product) or for custom low-level workflow
    (payment intent) - payment group`,
  })
  @Column({ type: 'varchar', length: 36 })
  @IsUndefinable()
  @Length(1, 36)
  entityId: string;

  @JSONSchema({
    description:
      'Processing amount, includes all fees, taxes. Presented in units, for instance: $100 = 10000 unit',
  })
  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

  @JSONSchema({
    description: `Sales tax or other, that should be paid to the government by tax collector. Tax included in the
      payment intent amount and storing as collected fees amount.`,
  })
  @Column({ type: 'int', default: 0 })
  @IsUndefinable()
  @IsNumber()
  tax: number;

  @JSONSchema({
    description: `Total fees: application, stripe, amount that application collect, tax, debit and credit extra fees. Contain all amounts that
    Platform is required or interested to grab from transaction. Should be the same as in Stripe`,
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
  @Column({ type: 'json', default: defaultParams })
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

import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TransactionStatus from '@constants/transaction-status';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IParams {
  // Example: re_3NhW8PAmQ4asS8PS0QPP80ER
  refundId?: string;
  // Reason for the refund, either user-provided
  reason?: string;
  // Error reason for failed refund
  errorReason?: string;
}

/**
 * Refund entity
 * @TODO Refund don't have pure relation to the transaction cause, cause:
 * 1. Transaction id is not unique (presented as debit and credit transactions)
 * 2. If relation will be refer to the transaction pk id, refunds will be duplicated for both transaction types
 */
@JSONSchema({ description: 'Created refund related to the transaction' })
@Entity()
class Refund {
  @PrimaryGeneratedColumn('uuid')
  @Length(1, 36)
  id: string;

  @JSONSchema({
    description: 'Stripe transaction id (e.g. payment intent)',
    example: 'pi_3Nha3JAmQ4asS8PS0JPXIyEh',
  })
  @PrimaryColumn({ type: 'varchar', length: 66 })
  @Length(1, 66)
  transactionId: string;

  @JSONSchema({
    description: 'Handled refund amount, should be less or equal to refund amount',
    example: 10000,
  })
  @JSONSchema({ description: 'Unit amount (e.g. 100$ = 10000 in unit' })
  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

  /**
   * Uses for creating relation for partial refund transaction that contain 2 or more
   * nested entities that were paid in single transaction
   */
  @JSONSchema({
    description: 'Microservice entity. Can be entity from transaction group or other',
  })
  @Column({ type: 'varchar', length: 36, default: null })
  @IsUndefinable()
  @IsNullable()
  @Length(1, 36)
  entityId: string | null;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @JSONSchema({
    description: 'Status should be started with the refund prefix',
  })
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.INITIAL })
  @IsEnum(TransactionStatus)
  @IsUndefinable()
  status: TransactionStatus;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Refund;

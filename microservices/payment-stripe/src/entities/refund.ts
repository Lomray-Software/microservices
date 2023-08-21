import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import TransactionStatus from '@constants/transaction-status';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IParams {
  // Reason for the refund, either user-provided
  reason?: string;
  // Error reason for failed refund
  errorReason?: string;
}

/**
 * Refund entity
 */
@Entity()
class Refund {
  @JSONSchema({
    description: 'Stripe transaction id (payment intent)',
    example: 'pi_3Nha3JAmQ4asS8PS0JPXIyEh',
  })
  @PrimaryColumn({ type: 'varchar', length: 66 })
  @Length(1, 66)
  transactionId: string;

  @JSONSchema({
    description: 'Requested refund amount',
  })
  @JSONSchema({ description: 'Unit amount (e.g. 100$ = 10000 in unit' })
  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

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

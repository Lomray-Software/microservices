import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { Allow, IsEnum, IsNumber, IsObject, Length, Min, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import DisputeReason from '@constants/dispute-reason';
import DisputeStatus from '@constants/dispute-status';
import EvidenceDetails from '@entities/evidence-details';
import type TCurrency from '@interfaces/currency';

export interface IMetadata {
  [key: string]: any;
}

export interface IParams {
  /**
   * If true, it’s still possible to refund the disputed payment. After the payment has been fully refunded,
   * no further funds are withdrawn from your Stripe account as a result of this dispute
   */
  isChargeRefundable: boolean;
  currency: TCurrency;
  networkReasonCode?: string | null; // 10.4
  paymentMethodType?: string | null; // card
  paymentMethodBrand?: string | null; // visa
  [key: string]: any;
}

/**
 * Dispute
 * @description Dispute doesn't have pure relation to the transaction for preventing duplication
 * Transaction id is not unique (presented as debit and credit transactions)
 */
@JSONSchema({
  title: 'Dispute',
  description:
    'A dispute occurs when a customer questions your charge with their card issuer. When this happens, you have the opportunity to respond to the dispute with evidence that shows that the charge is legitimate.',
  properties: {
    evidenceDetails: { $ref: '#/definitions/EvidenceDetails' },
  },
})
@Entity()
class Dispute {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @JSONSchema({
    description: 'Transaction id of microservice transaction entity',
    example: 'pi_3OIdULAmQ4asS8PS1dDLl0gN',
  })
  @Column({ type: 'varchar', length: 66, default: null })
  @Length(1, 66)
  @IsUndefinable()
  @IsNullable()
  transactionId: string | null;

  @JSONSchema({
    description: 'Stripe transaction id (payment intent)',
    example: 'dp_1OJXjDAmQ4asS8PSWXnvmwpj',
  })
  @Column({ type: 'varchar', length: 66 })
  @Length(1, 66)
  disputeId: string;

  @JSONSchema({
    description: 'Disputed transaction amount. Cannot be greater than transaction amount',
  })
  @Column({ type: 'int' })
  @IsNumber()
  @Min(0)
  amount: number;

  @JSONSchema({
    description: 'Required reason',
  })
  @Column({ type: 'enum', enum: DisputeReason })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @JSONSchema({
    description: 'Required status',
  })
  @Column({ type: 'enum', enum: DisputeStatus })
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @JSONSchema({
    description: 'Microservice entity params',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  @JSONSchema({
    description: 'Stripe dispute params',
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  metadata: IMetadata;

  @JSONSchema({
    description: 'Original disputed issued date',
  })
  @Column({ type: 'timestamp' })
  @IsTypeormDate()
  issuedAt: Date;

  @JSONSchema({
    description: 'Received from Stripe date',
  })
  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne('EvidenceDetails', 'dispute')
  @Type(() => EvidenceDetails)
  @ValidateNested()
  @IsUndefinable()
  evidenceDetails: EvidenceDetails;
}

export default Dispute;

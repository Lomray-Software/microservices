import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import DisputeReason from '@constants/dispute-reason';
import type TCurrency from '@interfaces/currency';

interface IParams {
  currency: TCurrency;
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
  amount: number;

  @Column({ type: 'enum', enum: DisputeReason })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

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
}

export default Dispute;

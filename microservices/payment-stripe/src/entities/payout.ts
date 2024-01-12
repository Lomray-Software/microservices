import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsDate, IsEnum, IsNumber, IsObject, IsString, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import PayoutMethod from '@constants/payout-method';
import PayoutStatus from '@constants/payout-status';
import PayoutType from '@constants/payout-type';

interface IParams {
  [k: string]: any;
}

/**
 * Payout entity
 */
@JSONSchema({
  title: 'Payout',
  description: `A Payout object is created when you receive funds from Stripe, or when you initiate a payout
    to either a bank account or debit card of a connected Stripe account. You can retrieve individual payouts,
    and list all payouts. Payouts are made on varying schedules, depending on your country and industry.`,
})
@Entity()
class Payout {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @JSONSchema({
    description: 'Stripe payout id',
  })
  @Unique('payout(uq):payoutId', ['payoutId'])
  @Column({ type: 'varchar', length: 66 })
  @Length(1, 66)
  payoutId: string;

  @JSONSchema({
    description: 'Min ±10 cents',
  })
  @Column({ type: 'int' })
  @IsNumber()
  @Min(10)
  amount: number;

  @JSONSchema({
    description: 'Id of the bank account or card the payout is sent to.',
  })
  @Column({ type: 'varchar', length: 66 })
  @Length(1, 66)
  destination: string;

  @JSONSchema({
    description: 'The method used to send this payout',
  })
  @Column({ type: 'enum', enum: PayoutMethod })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @Column({ type: 'enum', enum: PayoutType })
  @IsEnum(PayoutType)
  type: PayoutType;

  @JSONSchema({
    description: `A payout is pending until it’s submitted to the bank, when it becomes in_transit.
      The status changes to paid if the transaction succeeds, or to failed or canceled (within 5 business days).
      Some payouts that fail might initially show as paid, then change to failed.`,
  })
  @Column({ type: 'enum', enum: PayoutStatus })
  @IsEnum(PayoutStatus)
  status: PayoutStatus;

  @Column({ type: 'varchar', length: 10 })
  @Length(1, 10)
  currency: string;

  @Column({ type: 'varchar', length: 20, default: null })
  @Length(1, 20)
  @IsUndefinable()
  @IsNullable()
  failureCode: string | null;

  @Column({ type: 'text', default: null })
  @IsString()
  @IsUndefinable()
  @IsNullable()
  failureMessage: string | null;

  @JSONSchema({
    description: 'An arbitrary meta information attached to stripe payout instance',
  })
  @Column({ type: 'text', default: null })
  @IsString()
  @IsUndefinable()
  @IsNullable()
  description: string | null;

  @JSONSchema({
    description:
      'Date that you can expect the payout to arrive in the bank. This factors in delays to account for weekends or bank holidays',
  })
  @Column({ type: 'timestamptz' })
  @IsDate()
  arrivalDate: Date;

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
}

export default Payout;

import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsBoolean, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Customer from '@entities/customer';
import IsLastCardDigitsValid from '@helpers/validators/is-last-card-digits-valid';

/**
 * In case of stipe:
 * bankAccountId - only have cards from connected account and
 * cards related to SetupIntent doesn't have own id
 */
export interface IParams {
  bankAccountId?: string;
}

@JSONSchema({
  properties: {
    customer: { $ref: '#/definitions/Customer' },
  },
})
@Entity()
class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Index('IDX_card_userId', ['userId'])
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    description: 'Last 4 digits',
    example: '4242',
  })
  @Index('IDX_bank_account_lastDigits', ['lastDigits'])
  @Column({ type: 'varchar', length: 4 })
  @IsLastCardDigitsValid()
  @Length(1, 4)
  lastDigits: string;

  @Index('IDX_bank_account_bankName', ['bankName'])
  @Column({ type: 'varchar', length: 100, default: null })
  @IsUndefinable()
  @Length(1, 100)
  bankName: string | null;

  @Column({ type: 'varchar', length: 100, default: '' })
  @IsUndefinable()
  @Length(1, 100)
  holderName: string;

  @JSONSchema({
    description: "If it's the first attached user bank account it should be default",
  })
  @Column({ type: 'boolean', default: false })
  @IsUndefinable()
  @IsBoolean()
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  @IsUndefinable()
  isInstantPayoutAllowed: boolean;

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

  @ManyToOne('Customer', 'bankAccounts')
  @JoinColumn({ name: 'userId' })
  customer: Customer;
}

export default BankAccount;

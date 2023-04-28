import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export interface ICustomerParams {
  accountId?: string;
}

@Entity()
class Customer {
  @PrimaryColumn({ type: 'varchar', length: 18 })
  @Allow()
  customerId: string;

  @Index('IDX_payment_userId', ['userId'])
  @PrimaryColumn({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @JSONSchema({
    description: 'Store data about stripe connected account and etc.',
  })
  @Column({ type: 'json', default: {} })
  @Allow()
  @IsObject()
  @IsUndefinable()
  params: ICustomerParams;
}

export default Customer;

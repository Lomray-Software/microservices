import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsNumber, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IParams {}

/**
 * Refund entity
 */
@Entity()
class Refund {
  @JSONSchema({
    description: 'Microservices transaction id (uuid)',
  })
  @PrimaryColumn()
  @Length(1, 36)
  transactionId: string;

  @JSONSchema({ description: 'Unit amount (e.g. 100$ = 10000 in unit' })
  @Column({ type: 'int' })
  @IsNumber()
  amount: number;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: IParams;

  status: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Refund;

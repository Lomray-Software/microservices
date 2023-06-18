import { IsTypeormDate } from '@lomray/microservice-helpers';
import { IsNumber, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Product from '@entities/product';

@JSONSchema({
  properties: {
    product: { $ref: '#/definitions/Product' },
  },
})
@Entity()
class Price {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  @Length(1, 30)
  priceId: string;

  @Column({ type: 'varchar', length: 19 })
  @Length(1, 19)
  productId: string;

  @Index('IDX_price_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  userId: string;

  @Column({ type: 'varchar', length: 10 })
  @Length(1, 10)
  currency: string;

  @Column({ type: 'int' })
  @IsNumber()
  unitAmount: number;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Product', 'price')
  @JoinColumn({ name: 'productId' })
  product: Product;
}

export default Price;

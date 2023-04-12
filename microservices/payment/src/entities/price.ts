import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import Product from '@entities/product';

@JSONSchema({
  properties: {
    product: { $ref: '#/definitions/Product' },
  },
})
@Entity()
class Price {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  @Allow()
  priceId: string;

  @Column({ type: 'varchar', length: 19 })
  @Allow()
  productId: string;

  @Index('IDX_price_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId: string | null;

  @Column({ type: 'varchar', length: 10 })
  @Allow()
  currency: string;

  @Column({ type: 'int' })
  @Allow()
  unitAmount: number;

  @OneToOne('Product', 'price')
  @JoinColumn()
  product: Product;
}

export default Price;

import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsNumber, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Product from '@entities/product';

@JSONSchema({
  properties: {
    product: { $ref: '#/definitions/Product' },
  },
})
@Entity()
class Price {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  @IsString()
  @Length(1, 30)
  priceId: string;

  @Column({ type: 'varchar', length: 19 })
  @IsString()
  @Length(1, 19)
  productId: string;

  @Index('IDX_price_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @IsString()
  @IsNullable()
  @IsUndefinable()
  @Length(1, 36)
  userId: string | null;

  @Column({ type: 'varchar', length: 10 })
  @IsString()
  @Length(1, 10)
  currency: string;

  @Column({ type: 'int' })
  @IsNumber()
  unitAmount: number;

  @ManyToOne('Product', 'price')
  @JoinColumn({ name: 'productId' })
  product: Product;
}

export default Price;

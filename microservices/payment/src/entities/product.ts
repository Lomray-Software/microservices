import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, Index, OneToOne, PrimaryColumn } from 'typeorm';
import Price from '@entities/price';

@JSONSchema({
  properties: {
    price: { $ref: '#/definitions/Price' },
  },
})
@Entity()
class Product {
  @PrimaryColumn({ type: 'varchar', length: 19 })
  @Allow()
  productId: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  @Length(1, 36)
  entityId: string;

  @Index('IDX_product_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId: string | null;

  @OneToOne('Price', 'product')
  price: Price;
}

export default Product;

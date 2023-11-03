import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { Allow, IsObject, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import CartProductPrice from '@entities/cart-product-price';

@JSONSchema({
  properties: {
    items: { $ref: '#/definitions/CartProductPrice', type: 'array' },
  },
})
@Entity()
class Cart {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @JSONSchema({
    description: 'User id of the user who created the cart.',
  })
  @Column({ type: 'varchar', length: 36, default: null })
  @IsUndefinable()
  @IsNullable()
  userId: string | null;

  @JSONSchema({
    description: 'Using this field allows to store any additional data with the cart.',
  })
  @Column({ type: 'jsonb', default: {} })
  @IsUndefinable()
  params: Record<string, any>;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @JSONSchema({
    examples: [
      { priceId: 'price_1O554EEHwJl6pnAbKY23V8LO', quantity: 1 },
      { priceId: 'price_1O554EEHwJl6pnAb8wOcES6i', quantity: 3 },
    ],
  })
  @ValidateNested()
  @Type(() => CartProductPrice)
  @IsObject({ each: true })
  @IsUndefinable()
  @OneToMany('CartProductPrice', 'cart', { cascade: true })
  @JoinColumn({ name: 'cartId' })
  items: CartProductPrice[];
}

export default Cart;

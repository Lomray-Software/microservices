import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsNumber, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Price from '@entities/price';
import Cart from './cart';

@JSONSchema({
  properties: {
    cart: { $ref: '#/definitions/Cart' },
    price: { $ref: '#/definitions/Price' },
  },
})
@Entity()
class CartProductPrice {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar' })
  @Length(1, 36)
  @IsUndefinable({ groups: ['create'] })
  cartId: string;

  @Column({ type: 'varchar' })
  @Length(1, 36)
  priceId: string;

  @Column({ type: 'int', default: 1 })
  @IsNumber()
  @IsUndefinable()
  quantity: number;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Cart', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne('Price')
  @JoinColumn({ name: 'priceId' })
  price: Price;
}

export default CartProductPrice;

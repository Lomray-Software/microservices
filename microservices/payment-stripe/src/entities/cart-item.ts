import { IsTypeormDate } from '@lomray/microservice-helpers';
import { Allow, Length } from 'class-validator';
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

@Entity()
class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar' })
  @Length(1, 36)
  cartId: string;

  @Column({ type: 'varchar' })
  @Length(1, 36)
  priceId: string;

  @Column({ type: 'int', default: 1 })
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

export default CartItem;

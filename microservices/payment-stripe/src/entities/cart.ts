import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import CartItem from '@entities/cart-item';

@Entity()
class Cart {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 36, default: null })
  @IsUndefinable()
  @IsNullable()
  userId: string | null;

  @Column({ type: 'varchar', length: 36, default: null })
  @IsUndefinable()
  @IsNullable()
  entityId: string | null;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('CartItem', 'cart', { cascade: true })
  items: CartItem[];
}

export default Cart;

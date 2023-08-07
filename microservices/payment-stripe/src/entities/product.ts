import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Coupon from '@entities/coupon';
import Price from '@entities/price';
import Transaction from '@entities/transaction';

@JSONSchema({
  description: 'Entity for binding application entity with the according payment service entity',
  properties: {
    price: { $ref: '#/definitions/Price' },
    transactions: { $ref: '#/definitions/Transaction', type: 'array' },
    coupons: { $ref: '#/definitions/Coupon', type: 'array' },
  },
})
@Entity()
class Product {
  @JSONSchema({
    description: 'Field for storing id of according product entity created on payment service side',
  })
  @PrimaryColumn({ type: 'varchar', length: 19 })
  @Length(1, 19)
  productId: string;

  @JSONSchema({
    description: 'Field for storing id of selling entity from application',
  })
  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  entityId: string;

  @Index('IDX_product_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId: string | null;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Price', 'product')
  price: Price;

  @OneToMany('Transaction', 'product')
  transactions: Transaction[];

  @ManyToMany(() => Coupon)
  coupons: Coupon[];
}

export default Product;

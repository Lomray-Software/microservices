import { IsTypeormDate, IsValidate } from '@lomray/microservice-helpers';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import CouponDuration from '@constants/coupon-duration';
import Product from '@entities/product';
import PromoCode from '@entities/promo-code';

@JSONSchema({
  properties: {
    products: { $ref: '#/definitions/Product', type: 'array' },
    promoCodes: { $ref: '#/definitions/PromoCode', type: 'array' },
  },
})
@Entity()
class Coupon {
  @JSONSchema({
    description: 'Field for storing id of according coupon entity created on payment service side',
  })
  @PrimaryColumn({ type: 'varchar', length: 8 })
  @Length(1, 8)
  couponId: string;

  @JSONSchema({
    description: 'Name of the coupon displayed to customers on for instance invoices or receipts',
  })
  @Column({ type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  name: string | null;

  @JSONSchema({
    description: 'Amount that will be taken off the subtotal of any invoices for this customer.',
  })
  @Column({ type: 'float', nullable: true })
  @IsNumber()
  @IsOptional()
  amountOff?: number;

  @JSONSchema({
    description:
      'Percent that will be taken off the subtotal of any invoices for this customer for the duration of the coupon.',
  })
  @Column({ type: 'int', nullable: true })
  @IsValidate(Coupon, (coupon) => !coupon.amountOff)
  @Min(1)
  @Max(100)
  @IsInt()
  @IsOptional()
  percentOff?: number;

  @Column({
    type: 'enum',
    enum: CouponDuration,
  })
  @IsEnum(CouponDuration)
  duration: CouponDuration;

  @JSONSchema({
    description: 'If duration is repeating, the number of months the coupon applies.',
  })
  @Column({ type: 'int', nullable: true })
  @IsValidate(Coupon, (coupon) => coupon.duration === CouponDuration.REPEATING)
  @IsInt()
  durationInMonths: number | null;

  @JSONSchema({
    description:
      'Maximum number of times this coupon can be redeemed, in total, ' +
      'across all customers, before it is no longer valid.',
  })
  @Column({ type: 'int', nullable: true })
  @IsNumber()
  @IsOptional()
  maxRedemptions: number | null;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Product, (product) => product.coupons)
  @JoinTable({
    joinColumn: {
      name: 'couponId',
      referencedColumnName: 'couponId',
    },
    inverseJoinColumn: {
      name: 'productId',
      referencedColumnName: 'productId',
    },
  })
  products: Product[];

  @OneToMany(() => PromoCode, (promoCode) => promoCode.coupon)
  promoCodes: PromoCode[];
}

export default Coupon;

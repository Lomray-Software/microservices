import { IsNullable, IsTypeormDate, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber, Length, Max, Min, ValidateNested } from 'class-validator';
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

  @Column({ type: 'uuid', default: null })
  @IsNullable()
  @IsUndefinable()
  @Length(1, 36)
  userId: string | null;

  @JSONSchema({
    description: 'Name of the coupon displayed to customers on for instance invoices or receipts',
  })
  @Column({ type: 'varchar', length: 100, default: null })
  @IsNullable()
  @IsUndefinable()
  @Length(1, 100)
  name: string | null;

  @JSONSchema({
    description: 'Amount that will be taken off the subtotal of any invoices for this customer.',
  })
  @Column({ type: 'float', default: null })
  @IsNullable()
  @IsUndefinable()
  @IsNumber()
  amountOff: number | null;

  @JSONSchema({
    description:
      'Percent that will be taken off the subtotal of any invoices for this customer for the duration of the coupon.',
  })
  @Column({ type: 'int', default: null })
  @IsNullable()
  @IsUndefinable()
  @IsValidate(Coupon, (entity) => !Coupon.isAmountOffExists(entity))
  @Min(1)
  @Max(100)
  @IsNumber()
  percentOff: number | null;

  @Column({
    type: 'enum',
    enum: CouponDuration,
  })
  @IsEnum(CouponDuration)
  duration: CouponDuration;

  @JSONSchema({
    description: 'If duration is repeating, the number of months the coupon applies.',
  })
  @Column({ type: 'int', default: null })
  @IsNullable()
  @IsUndefinable()
  @IsValidate(Coupon, (entity) => Coupon.isDurationRepeating(entity))
  @IsNumber()
  durationInMonths: number | null;

  @JSONSchema({
    description:
      'Maximum number of times this coupon can be redeemed, in total, ' +
      'across all customers, before it is no longer valid.',
  })
  @Column({ type: 'int', default: null })
  @IsNullable()
  @IsUndefinable()
  @IsNumber()
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

  @ValidateNested()
  @OneToMany(() => PromoCode, (promoCode) => promoCode.coupon)
  promoCodes: PromoCode[];

  /**
   * Check if amountOff exists
   */
  private static isAmountOffExists(entity: Coupon) {
    return Boolean(entity.amountOff);
  }

  /**
   * Check if duration is repeating
   */
  private static isDurationRepeating(entity: Coupon) {
    return entity.duration === CouponDuration.REPEATING;
  }
}

export default Coupon;

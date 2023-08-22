import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsObject, Length, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Coupon from '@entities/coupon';

@JSONSchema({
  properties: {
    coupon: { $ref: '#/definitions/Coupon' },
  },
})
@Entity()
class PromoCode {
  @JSONSchema({
    description:
      'Field for storing id of according promo code entity created on payment service side',
  })
  @PrimaryColumn({ type: 'varchar', length: 30 })
  promoCodeId: string;

  @Column({ type: 'varchar', length: 8 })
  @Length(1, 8)
  couponId: string;

  @JSONSchema({
    description: 'The customer-facing code.',
  })
  @Column({ type: 'varchar', length: 15 })
  @Length(1, 15)
  @IsUndefinable()
  code: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('Coupon', 'promoCodes')
  @JoinColumn({ name: 'couponId' })
  @ValidateNested()
  @IsObject()
  coupon: Coupon;
}

export default PromoCode;

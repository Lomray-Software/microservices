import { IsTypeormDate } from '@lomray/microservice-helpers';
import { IsOptional, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Coupon from '@entities/coupon';
import IsValidStripeId from '@helpers/validators/is-stripe-id-valid';

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
  @IsValidStripeId()
  @Length(1, 30)
  promoCodeId: string;

  @JSONSchema({
    description: 'The customer-facing code.',
  })
  @Column({ type: 'varchar' })
  @IsString()
  @IsOptional()
  code: string;

  @Column()
  @IsString()
  couponId: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PromoCode)
  coupon: Coupon;
}

export default PromoCode;

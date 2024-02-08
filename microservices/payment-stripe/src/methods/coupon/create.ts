import { Endpoint, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsObject, IsString, Length } from 'class-validator';
import CouponDuration from '@constants/coupon-duration';
import Coupon from '@entities/coupon';
import TCurrency from '@interfaces/currency';
import Stripe from '@services/payment-gateway/stripe';

class CreateCouponInput {
  @IsEnum(CouponDuration)
  duration: CouponDuration;

  @IsString({ each: true })
  products: string[];

  @Length(1, 36)
  @IsUndefinable()
  userId?: string;

  @Length(1, 100)
  @IsUndefinable()
  name?: string;

  @Length(3, 3)
  @IsUndefinable()
  currency?: TCurrency;

  @IsNumber()
  @IsUndefinable()
  amountOff?: number;

  @IsNumber()
  @IsUndefinable()
  percentOff?: number;

  @IsValidate(CreateCouponInput, (entity) => CreateCouponInput.isDurationRepeating(entity))
  @IsNumber()
  durationInMonths?: number;

  @IsNumber()
  @IsUndefinable()
  maxRedemptions?: number;

  /**
   * Check if duration is repeating
   */
  private static isDurationRepeating(entity: CreateCouponInput): boolean {
    return entity.duration === CouponDuration.REPEATING;
  }
}

class CreateCouponOutput {
  @IsObject()
  @Type(() => Coupon)
  entity: Coupon;
}

/**
 * Create new coupon
 */
const create = Endpoint.custom(
  () => ({
    input: CreateCouponInput,
    output: CreateCouponOutput,
    description: 'Create new coupon',
  }),
  async ({
    userId,
    name,
    currency,
    amountOff,
    percentOff,
    duration,
    durationInMonths,
    maxRedemptions,
    products,
  }) => {
    const service = await Stripe.init();

    return {
      entity: await service.createCoupon({
        userId,
        name,
        currency,
        amountOff,
        percentOff,
        duration,
        durationInMonths,
        maxRedemptions,
        products,
      }),
    };
  },
);

export default create;

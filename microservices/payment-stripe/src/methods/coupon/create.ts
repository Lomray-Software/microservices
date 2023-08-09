import { Endpoint, IsUndefinable, IsValidate } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsObject, IsString, Length } from 'class-validator';
import { getManager } from 'typeorm';
import CouponDuration from '@constants/coupon-duration';
import Coupon from '@entities/coupon';
import TCurrency from '@interfaces/currency';
import Factory from '@services/payment-gateway/factory';

class CreateCouponInput {
  @IsUndefinable()
  @Length(1, 36)
  userId?: string;

  @IsUndefinable()
  @Length(1, 100)
  name?: string;

  @IsUndefinable()
  @Length(3, 3)
  currency?: TCurrency;

  @IsUndefinable()
  @IsNumber()
  amountOff?: number;

  @IsUndefinable()
  @IsNumber()
  percentOff?: number;

  @IsEnum(CouponDuration)
  duration: CouponDuration;

  @IsValidate(CreateCouponInput, (entity) => CreateCouponInput.isDurationRepeating(entity))
  @IsNumber()
  durationInMonths?: number;

  @IsUndefinable()
  @IsNumber()
  maxRedemptions?: number;

  @IsString({ each: true })
  products: string[];

  /**
   * Check if duration is repeating
   */
  private static isDurationRepeating(entity: CreateCouponInput) {
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
    const service = await Factory.create(getManager());

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

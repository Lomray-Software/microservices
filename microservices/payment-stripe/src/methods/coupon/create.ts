import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { getManager } from 'typeorm';
import CouponDuration from '@constants/coupon-duration';
import Coupon from '@entities/coupon';
import TCurrency from '@interfaces/currency';
import Factory from '@services/payment-gateway/factory';

class CreateCouponInput {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  currency?: TCurrency;

  @IsNumber()
  @IsOptional()
  amountOff?: number;

  @IsInt()
  @IsOptional()
  percentOff?: number;

  @IsEnum(CouponDuration)
  duration: CouponDuration;

  @ValidateIf((object) => object.duration === CouponDuration.REPEATING)
  @IsInt()
  durationInMonths?: number;

  @IsNumber()
  @IsOptional()
  maxRedemptions?: number;

  @IsString({ each: true })
  products: string[];
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
  async (params) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.createCoupon({
        ...params,
      }),
    };
  },
);

export default create;

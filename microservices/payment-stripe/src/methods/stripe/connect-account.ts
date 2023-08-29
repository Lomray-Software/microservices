import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import BusinessType from '@constants/business-type';
import StripeAccountTypes from '@constants/stripe-account-types';
import Factory from '@services/payment-gateway/factory';

class ConnectAccountInput {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  accountType: StripeAccountTypes;

  @IsString()
  refreshUrl: string;

  @IsString()
  returnUrl: string;

  @IsEnum(BusinessType)
  @IsUndefinable()
  businessType?: BusinessType;
}

class ConnectAccountOutput {
  @IsString()
  accountLink: string;
}

/**
 * Create new connected account
 */
const connectAccount = Endpoint.custom(
  () => ({
    input: ConnectAccountInput,
    output: ConnectAccountOutput,
    description: 'Create new connected account with link',
  }),
  async ({ userId, email, accountType, refreshUrl, returnUrl, businessType }) => {
    const service = await Factory.create(getManager());

    return {
      accountLink: await service.connectAccount(
        userId,
        email,
        accountType,
        refreshUrl,
        returnUrl,
        businessType,
      ),
    };
  },
);

export default connectAccount;

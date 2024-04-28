import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsString, Length } from 'class-validator';
import AgreementType from '@constants/agreement-type';
import BusinessType from '@constants/business-type';
import StripeAccountTypes from '@constants/stripe-account-types';
import Stripe from '@services/payment-gateway/stripe';

class ConnectAccountInput {
  @Length(1, 36)
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

  @IsString()
  @IsUndefinable()
  country?: string;

  @IsEnum(AgreementType)
  @IsUndefinable()
  serviceAgreement?: AgreementType;
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
  async ({
    userId,
    email,
    accountType,
    refreshUrl,
    returnUrl,
    businessType,
    country,
    serviceAgreement,
  }) => {
    const service = await Stripe.init();

    return {
      accountLink: await service.connectAccount(
        userId,
        email,
        accountType,
        refreshUrl,
        returnUrl,
        businessType,
        country,
        serviceAgreement,
      ),
    };
  },
);

export default connectAccount;

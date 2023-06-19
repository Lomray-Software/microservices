import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import StripePaymentMethods from '@constants/stripe-payment-methods';
import Factory from '@services/payment-gateway/factory';

class SetDefaultPaymentMethodInput {
  @IsString()
  userId: string;

  /**
   * Card or bank account id
   */
  @IsString()
  entityId: string;

  @IsString()
  type: StripePaymentMethods.CARD | StripePaymentMethods.BANKCONTACT;
}

class SetDefaultPaymentMethodOutput {
  @IsBoolean()
  isSet: boolean;
}

/**
 * Sets default payment method
 */
const setDefaultPaymentMethod = Endpoint.custom(
  () => ({
    input: SetDefaultPaymentMethodInput,
    output: SetDefaultPaymentMethodOutput,
    description: 'Sets default payment method',
  }),
  async ({ userId, entityId, type }) => {
    const service = await Factory.create(getManager());

    return {
      isSet: await service.setDefaultPaymentMethod(userId, entityId, type),
    };
  },
);

export default setDefaultPaymentMethod;

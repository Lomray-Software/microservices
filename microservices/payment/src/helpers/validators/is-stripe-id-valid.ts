import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Is valid stripe id validator
 * NOTE: Validate bank account, card and payment method (e.g. from setup intent)
 */
const IsValidStripeId = (validationOptions?: ValidationOptions) =>
  function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidStripeId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return value.startsWith('ba_') || value.startsWith('card_') || value.startsWith('pm_');
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not a valid Stripe Id`;
        },
      },
    });
  };

export default IsValidStripeId;

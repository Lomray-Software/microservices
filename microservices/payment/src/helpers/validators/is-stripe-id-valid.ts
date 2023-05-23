import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Is valid stripe id validator
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
          return value.startsWith('ba_') || value.startsWith('card_');
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not a valid Stripe Id`;
        },
      },
    });
  };

export default IsValidStripeId;

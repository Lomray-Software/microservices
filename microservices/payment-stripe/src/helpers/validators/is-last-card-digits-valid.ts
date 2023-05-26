import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validates card last digits
 */
const IsLastCardDigitsValid =
  (validationOptions?: ValidationOptions) => (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isLastCardDigitsValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }

          return /^\d{4}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a 4-digit number.`;
        },
      },
    });
  };

export default IsLastCardDigitsValid;

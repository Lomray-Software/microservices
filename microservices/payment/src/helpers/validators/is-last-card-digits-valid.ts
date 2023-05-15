import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validate last card digits
 */
const IsLastDigitsValid =
  (validationOptions?: ValidationOptions) => (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isLast4Digits',
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

export default IsLastDigitsValid;
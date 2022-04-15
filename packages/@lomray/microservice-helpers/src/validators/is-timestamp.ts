import { ValidateBy, ValidationOptions } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';

function IsTimestamp(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isTimestamp',
      validator: {
        validate: (value: unknown) => typeof value === 'number' && String(value).length === 10,
        defaultMessage: ({ value }: ValidationArguments) =>
          `Current value "${value as string}" is not timestamp.`,
      },
    },
    validationOptions,
  );
}

export default IsTimestamp;

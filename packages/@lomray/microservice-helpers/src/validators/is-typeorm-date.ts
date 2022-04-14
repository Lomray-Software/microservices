import { ValidateBy, ValidationOptions } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import _ from 'lodash';

function IsTypeormDate(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isTypeormDate',
      validator: {
        validate: (value: unknown) =>
          _.isNil(value) || value instanceof Date || typeof value === 'string',
        defaultMessage: ({ value }: ValidationArguments) =>
          `Current value "${value as string}" is not in format "2022-04-14 08:34:30.394592"`,
      },
    },
    validationOptions,
  );
}

export default IsTypeormDate;

import { ValidationOptions, ValidateBy } from 'class-validator';
import isCamelCaseString from '@helpers/is-camel-case-string';
import { ISchema } from '@interfaces/component';

/**
 * Validate string
 * Accept strings composed of atomic alphabet.
 */
function IsCamelCaseSchema(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isCamelCaseSchema',
      validator: {
        validate: (schema: ISchema[] = []) => schema.every(({ name }) => isCamelCaseString(name)),
        defaultMessage: () =>
          "Provided string value isn't compatible with the camel case string rule",
      },
    },
    validationOptions,
  );
}

export default IsCamelCaseSchema;

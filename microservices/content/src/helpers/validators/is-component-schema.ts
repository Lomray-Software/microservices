import { ValidateBy } from 'class-validator';
import type { ValidationOptions } from 'class-validator';
import isComponentInputValid from '@helpers/is-component-input-valid';
import { ISchema } from '@interfaces/component';

/**
 * Validate relation inputs
 */
function IsRelationSchema(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isRelationSchema',
      validator: {
        validate: (schema: ISchema[] = []) => isComponentInputValid(schema),
        defaultMessage: () => "Provided schema isn't compatible with the component input type",
      },
    },
    validationOptions,
  );
}

export default IsRelationSchema;

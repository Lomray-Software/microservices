import { ValidateBy } from 'class-validator';
import type { ValidationOptions } from 'class-validator';
import isRelationInputValid from '@helpers/is-relation-input-valid';
import { ISchema } from '@interfaces/component';

/**
 * Validate component inputs
 */
function IsRelationSchema(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isRelationSchema',
      validator: {
        validate: (schema: ISchema[] = []) => isRelationInputValid(schema),
        defaultMessage: () => "Provided schema isn't compatible with the relation input type",
      },
    },
    validationOptions,
  );
}

export default IsRelationSchema;

import InputType from '@constants/input-type';
import { IComponentSchema, ISchema } from '@interfaces/component';

/**
 * Return validation schema result for component inputs
 */
const isComponentInputValid = (schema: ISchema[]): boolean => {
  if (!schema.length) {
    return true;
  }

  const inputs = schema.filter(({ type }) => type === InputType.COMPONENT) as IComponentSchema[];

  if (!inputs) {
    return true;
  }

  return inputs.every((input) => input?.id && typeof input?.hasMany === 'boolean');
};

export default isComponentInputValid;

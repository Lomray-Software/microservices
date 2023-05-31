import InputType from '@constants/input-type';
import { ISchema, IRelationSchema } from '@interfaces/component';

/**
 * Return validation schema result for relation inputs
 */
const isRelationInputValid = (schema: ISchema[]): boolean => {
  if (!schema.length) {
    return true;
  }

  const inputs = schema.filter(({ type }) => type === InputType.RELATION) as IRelationSchema[];

  if (!inputs) {
    return true;
  }

  return inputs.every(
    (input) =>
      input?.relation?.entity &&
      input?.relation?.microservice &&
      input?.relation?.fields.length > 0 &&
      typeof input?.relation?.hasMany === 'boolean',
  );
};

export default isRelationInputValid;

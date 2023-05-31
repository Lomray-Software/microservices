import InputType from '@constants/input-type';
import { ISchema, IRelationSchema } from '@interfaces/component';

const isSearchFieldsValid = (fields: IRelationSchema['relation']['searchFields']) =>
  fields?.every((field) => field?.name?.length > 0) ?? false;

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
      isSearchFieldsValid(input?.relation?.searchFields) &&
      input.relation?.idFields?.length > 0 &&
      input.relation?.titleFields?.length > 0 &&
      typeof input?.relation?.hasMany === 'boolean',
  );
};

export default isRelationInputValid;

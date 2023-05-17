import InputType from '@constants/input-type';

const schemaObjectTypes = {
  [InputType.TEXT]: 'string',
  [InputType.NUMBER]: 'number',
  [InputType.RICH_TEXT]: 'string',
  [InputType.DATE]: 'object',
  [InputType.BOOLEAN]: 'boolean',
  [InputType.EMAIL]: 'string',
  [InputType.PASSWORD]: 'string',
  [InputType.JSON]: 'object',
  [InputType.ENUM]: 'array',
};

export default schemaObjectTypes;

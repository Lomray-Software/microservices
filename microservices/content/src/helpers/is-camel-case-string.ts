/**
 * Return validation status for passed string
 */
const isCamelCaseString = (value: string): boolean =>
  /^[a-z]+[a-zA-Z]*([A-Z][a-zA-Z]*)*$/.test(value);

export default isCamelCaseString;

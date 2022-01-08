import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Skips validation if the target is null
 */
function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return function IsNullableDecorator(
    prototype: Record<string, any>,
    propertyKey: string | symbol,
  ) {
    ValidateIf((obj) => obj[propertyKey] !== null, options)(prototype, propertyKey);
  };
}

export default IsNullable;

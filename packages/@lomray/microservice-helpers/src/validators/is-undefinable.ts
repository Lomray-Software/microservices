import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Skips validation if the target is undefined
 */
function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
  return function IsUndefinedDecorator(
    prototype: Record<string, any>,
    propertyKey: string | symbol,
  ) {
    ValidateIf((obj) => obj[propertyKey] !== undefined, options)(prototype, propertyKey);
  };
}

export default IsUndefinable;

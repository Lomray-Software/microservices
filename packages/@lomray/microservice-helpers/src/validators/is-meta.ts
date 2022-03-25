import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Special decorator for add property relation in microservice metadata
 * @constructor
 */
function IsMeta(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'isMeta',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate() {
          return false;
        },
      },
    });
  };
}

export default IsMeta;

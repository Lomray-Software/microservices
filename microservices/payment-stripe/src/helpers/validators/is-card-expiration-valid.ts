import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import isCardExpirationDateValid from '@helpers/is-card-expiration-date-valid';

/**
 * Card expiration date validator
 */
@ValidatorConstraint({ name: 'isCardExpirationValid', async: false })
class IsCardExpirationValidConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return isCardExpirationDateValid(value);
  }
}

/**
 * Validate card expiration date
 */
const IsCardExpirationValid =
  (validationOptions?: ValidationOptions) => (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCardExpirationValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsCardExpirationValidConstraint,
    });
  };

export default IsCardExpirationValid;

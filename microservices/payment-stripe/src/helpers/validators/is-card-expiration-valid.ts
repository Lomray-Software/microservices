import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import isCardExpirationDateValid from '@helpers/is-card-expiration-date-valid';

/**
 * Card expiration date validator
 * @description Card expires in the first day of the next month
 * @example Expiration date 02/23. At the 1st of 03/23 card will be expired
 */
@ValidatorConstraint({ name: 'isCardExpirationValid', async: false })
class IsCardExpirationValidConstraint implements ValidatorConstraintInterface {
  /**
   * Validate card expiration
   */
  public validate(value: string) {
    return isCardExpirationDateValid(value);
  }

  /**
   * Returns default error message
   */
  public defaultMessage(): string {
    return 'Card has expired.';
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

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Card expiration date validator
 */
@ValidatorConstraint({ name: 'isCardExpirationValid', async: false })
class IsCardExpirationValidConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const currentDate = new Date();
    const [expirationMonth, expirationYear] = value.split('/');

    if (!expirationMonth || !expirationYear) {
      return false;
    }

    const expirationDate = new Date(Number(expirationYear), Number(expirationMonth) - 1, 1);

    expirationDate.setHours(0, 0, 0, 0);

    return expirationDate >= currentDate;
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

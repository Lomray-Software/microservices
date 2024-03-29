import { Repository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import Abstract from '@services/confirm/abstract';
import EmailConfirm from '@services/confirm/email';
import PhoneConfirm from '@services/confirm/phone';

enum ConfirmBy {
  email = 'email',
  phone = 'phone',
}

/**
 * Confirmation factory
 */
class Factory {
  /**
   * Create confirmation service
   */
  static create(
    type: ConfirmBy,
    repository: Repository<ConfirmCode>,
    context?: Record<string, any>,
  ): Abstract {
    switch (type) {
      case ConfirmBy.email:
        return new EmailConfirm(repository, context);

      case ConfirmBy.phone:
        return new PhoneConfirm(repository, context);
    }
  }
}

export { Factory, ConfirmBy };

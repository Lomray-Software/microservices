import { EntityManager } from 'typeorm';
import { IdProvider } from '@entities/identity-provider';
import Abstract from '@services/identity-provider/abstract';
import Firebase from '@services/identity-provider/firebase';

/**
 * Provider factory
 */
class Factory {
  /**
   * Create identity provider instance
   */
  public static create(provider: IdProvider, token: string, manager: EntityManager): Abstract {
    switch (provider) {
      case IdProvider.FIREBASE:
        return new Firebase(provider, token, manager);
    }
  }
}

export default Factory;

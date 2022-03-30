import crypto from 'crypto';
import { InsertResult, Repository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';

/**
 * Abstract class for confirmation services
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected readonly repository: Repository<ConfirmCode>;

  /**
   * @constructor
   */
  public constructor(repository: Abstract['repository']) {
    this.repository = repository;
  }

  /**
   * Send confirmation service
   */
  public abstract send(login: string): Promise<boolean> | boolean;

  /**
   * Generate confirmation code
   * @protected
   */
  protected generateCode(min = 100000, max = 999999): string {
    return String(crypto.randomInt(min, max));
  }

  /**
   * Save code
   * @protected
   */
  protected saveCode(
    login: string,
    code: string,
    expirationAt: number | null = null,
  ): Promise<InsertResult> {
    return this.repository.upsert(
      {
        login,
        code,
        // set default expiration = 1 hour if not passed
        expirationAt: expirationAt === null ? Abstract.getTimestamp() + 60 * 60 : expirationAt,
      },
      ['login'],
    );
  }

  /**
   * Verify confirmation code
   */
  public async verifyCode(login?: string | null, code?: string | number): Promise<boolean> {
    if (!login || !code) {
      return false;
    }

    const model = await this.repository.findOne({ login, code });

    if (!model) {
      return false;
    }

    await this.repository.remove(model);

    return Abstract.getTimestamp() <= model.expirationAt;
  }

  /**
   * Get current timestamp
   * @private
   */
  private static getTimestamp(): number {
    return Math.round(Date.now() / 1000);
  }
}

export default Abstract;

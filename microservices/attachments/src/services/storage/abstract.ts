import CONST from '@constants/index';

/**
 * Abstract class for storage providers
 */
abstract class Abstract {
  /**
   * Upload file
   */
  public abstract upload(key: string, buffer: Buffer, mime: string): Promise<void> | void;

  /**
   * Delete files
   */
  public abstract delete(key: string): Promise<void> | void;

  /**
   * Get storage domain
   */
  public getDomain(): string {
    return CONST.MS_STORAGE_DOMAIN;
  }
}

export default Abstract;

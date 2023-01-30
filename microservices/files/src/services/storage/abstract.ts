/**
 * Abstract class for storage providers
 */
abstract class Abstract {
  /**
   * Storage domain
   * @protected
   */
  protected readonly domain?: string;

  /**
   * @constructor
   */
  protected constructor(domain?: string) {
    this.domain = domain;
  }

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
    return this.domain || '';
  }

  /**
   * Post process handling file url
   */
  public handleUrl(url: string): string {
    return `${this.getDomain() || ''}${url}`;
  }
}

export default Abstract;

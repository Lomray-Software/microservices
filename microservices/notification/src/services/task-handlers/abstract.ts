/**
 * Abstract class for notify tasks
 */
abstract class Abstract {
  /**
   * Process notify tasks
   */
  public abstract process(): Promise<boolean>;
}

export default Abstract;

import _ from 'lodash';
import TaskEntity from '@entities/task';

/**
 * Abstract class for notify tasks
 */
abstract class Abstract {
  /**
   * Tasks
   */
  protected readonly tasks: TaskEntity[] = [];

  /**
   * Process notify tasks
   */
  public abstract process(): Promise<number>;

  /**
   * Get and handle events
   */
  public take(events: TaskEntity[], conditionCallback?: (event: TaskEntity) => boolean): boolean {
    if (!conditionCallback) {
      return false;
    }

    _.remove(events, (event) => {
      if (!conditionCallback(event)) {
        return false;
      }

      this.tasks.push(event);

      return true;
    });

    return this.tasks.length > 0;
  }
}

export default Abstract;

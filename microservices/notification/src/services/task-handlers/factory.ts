import { ClassReturn } from '@lomray/client-helpers/interfaces/class-return';
import { getManager } from 'typeorm';
import TaskEntity from '@entities/task';
import type IHandledCounts from '@interfaces/handled-counts';
import Abstract from './abstract';
import EmailAll from './email-all';
import NoticeAll from './notice-all';

/**
 * Notify task factory
 * @description Call this factory in job for processing notify tasks
 */
class Factory {
  /**
   * Task services
   */
  protected static services: ClassReturn<Abstract>[] = [NoticeAll, EmailAll];

  /**
   * Handle task init services
   */
  public static init(events: TaskEntity[]): Abstract[] {
    const matchedServices: Abstract[] = [];

    /**
     * Init services
     */
    for (const service of Factory.services) {
      const serviceInstance = new service(getManager());

      if (!events.length) {
        break;
      }

      if (serviceInstance.take(events)) {
        matchedServices.push(serviceInstance);
      }
    }

    return matchedServices;
  }

  /**
   * Auto process services
   */
  public static async process(events: TaskEntity[]): Promise<IHandledCounts> {
    const services = Factory.init(events);

    /**
     * Get total tasks processed counts from all processed services
     */
    const counts = await Promise.all(services.map((s) => s.process()));

    return counts.reduce(
      (acc, currentValue) => {
        acc.total += currentValue.total;
        acc.completed += currentValue.completed;
        acc.failed += currentValue.failed;

        return acc;
      },
      { total: 0, completed: 0, failed: 0 },
    );
  }
}

export default Factory;

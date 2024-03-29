import { ClassReturn } from '@lomray/client-helpers/interfaces/class-return';
import { EntityManager, getManager } from 'typeorm';
import TaskEntity from '@entities/task';
import type IHandledCounts from '@interfaces/handled-counts';
import Abstract from './abstract';
import EmailAll from './email-all';
import EmailGroup from './email-group';
import NoticeAll from './notice-all';

/**
 * Notify task factory
 * @description Call this factory in job for processing notify tasks
 */
class Factory {
  /**
   * Task services
   */
  protected static services: ClassReturn<Abstract>[] = [NoticeAll, EmailAll, EmailGroup];

  /**
   * Handle task init services
   */
  public static init(tasks: TaskEntity[], manager: EntityManager = getManager()): Abstract[] {
    const matchedServices: Abstract[] = [];

    /**
     * Init services
     */
    for (const service of Factory.services) {
      const serviceInstance = new service(manager);

      if (!tasks.length) {
        break;
      }

      if (serviceInstance.take(tasks)) {
        matchedServices.push(serviceInstance);
      }
    }

    return matchedServices;
  }

  /**
   * Auto process services
   */
  public static async process(tasks: TaskEntity[]): Promise<IHandledCounts> {
    const services = Factory.init(tasks);

    /**
     * Get total tasks processed counts from all processed services
     */
    const counts = await Promise.all(services.map((s) => s.process()));

    return counts.reduce(
      (totalCounts, { total, completed, failed }) => {
        totalCounts.total += total;
        totalCounts.completed += completed;
        totalCounts.failed += failed;

        return totalCounts;
      },
      { total: 0, completed: 0, failed: 0 },
    );
  }
}

export default Factory;

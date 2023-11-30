import Jobs from '@lomray/microservice-helpers/services/jobs';
import TaskProcess from '@jobs/task/process';

/**
 * Register jobs
 */
export default (service: Jobs): void => {
  /**
   * Task
   */
  service.addJobEndpoint('task.process', TaskProcess);
};

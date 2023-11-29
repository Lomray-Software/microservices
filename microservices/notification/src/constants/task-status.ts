/**
 * Task status
 * @description Retry process with waiting status will be if last target error exist
 */
enum TaskStatus {
  INIT = 'init',
  WAITING = 'waiting',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export default TaskStatus;

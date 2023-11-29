enum TaskMode {
  // In this mode tasks will process with last target error without additional checks
  DEFAULT = 'default',
  /**
   * In this mode tasks will be rechecked before execute, check if exist in db for each chunk
   * @description Usage: If whole backend will down, and for instance, some users will not receive emails
   * and 3000 users already received email, but task have waiting status without last target error,
   * because whole backed down and notification microservice did not update actual task statuses.
   */
  FULL_CHECK_UP = 'fullCheckUp',
}

export default TaskMode;

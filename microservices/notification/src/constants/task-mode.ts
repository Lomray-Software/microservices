enum TaskMode {
  // In this mode tasks will process with last target error without additional checks
  DEFAULT = 'default',
  /**
   * In this mode tasks will be rechecked before execute, check if exist in db for each chunk
   * @description Usage: In microservice will down, and for instance, some users will not receive emails
   * and 3000 users already received email, but task have waiting status without last target error (microservice down).
   */
  FULL_CHECK_UP = 'fullCheckUp',
}

export default TaskMode;

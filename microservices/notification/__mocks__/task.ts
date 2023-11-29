import TaskType from '@constants/task-type';
import Task from '@entities/task';

const taskMock = {
  type: TaskType.NOTICE_ALL,
  lastFailTargetId: null,
} as Task;

// eslint-disable-next-line import/prefer-default-export
export { taskMock };

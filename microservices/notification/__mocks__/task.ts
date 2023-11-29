import TaskType from '@constants/task-type';
import Task from '@entities/task';

const taskMock = {
  type: TaskType.NOTICE_ALL,
  lastFailTargetId: null,
  params: {},
} as Task;

const handledCountsMock = { total: 0, completed: 0, failed: 0 };

export { taskMock, handledCountsMock };

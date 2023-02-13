import { GetMsStartConfig } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import CONST from '@constants/index';
import Task from '@entities/task';
import registerMethods from '@methods/index';
import TaskRepository from '@repositories/task';
import TaskManager from '@services/task-manager';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'microservice',
  registerMethods,
  hooks: {
    afterCreateMicroservice: async (ms) => {
      const taskManager = TaskManager.init(ms);
      const taskRepository = getCustomRepository(TaskRepository);
      const tasksCount = await taskRepository.count();

      if (!tasksCount) {
        await taskRepository.bulkSave(JSON.parse(CONST.MS_INIT_TASKS) as Partial<Task>[]);
      }

      await taskManager.assignNodeId();
      await taskManager.run();
    },
  },
});

export default startConfig;

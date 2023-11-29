import { Endpoint } from '@lomray/microservice-helpers';
import { IsNumber } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import type IHandledCounts from '@interfaces/handled-counts';
import ProcessService from '@services/task/process';

class ProcessOutput implements IHandledCounts {
  @JSONSchema({
    description: 'Total tasks processed',
  })
  @IsNumber()
  total: number;

  @JSONSchema({
    description: 'Total tasks completed',
  })
  @IsNumber()
  completed: number;

  @JSONSchema({
    description: 'Total tasks failed',
  })
  @IsNumber()
  failed: number;
}

/**
 * Process tasks
 */
const process = Endpoint.custom(
  () => ({
    output: ProcessOutput,
    description: 'Process tasks',
  }),
  () => ProcessService.init().retrieveAndProcessTasks(),
);

export default process;

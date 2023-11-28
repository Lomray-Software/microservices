import { Endpoint } from '@lomray/microservice-helpers';
import { IsNumber } from 'class-validator';
import ProcessService from '@services/task/process';

class ProcessOutput {
  @IsNumber()
  count: number;
}

/**
 * Process tasks
 */
const process = Endpoint.custom(
  () => ({
    output: ProcessOutput,
    description: 'Process tasks',
  }),
  async () => ({
    count: await ProcessService.init().checkoutAndProcess(),
  }),
);

export default process;

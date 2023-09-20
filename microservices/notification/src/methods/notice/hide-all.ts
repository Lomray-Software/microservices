import { Endpoint } from '@lomray/microservice-helpers';
import { IsNumber } from 'class-validator';
import Notice from '@services/notice';

class HideAllOutput {
  @IsNumber()
  affected: number;
}

/**
 * Hide all user's notifications
 */
const hideAll = Endpoint.custom(
  () => ({
    output: HideAllOutput,
    description: 'Notifications multiple hide',
  }),
  async ({ payload }) => ({
    affected: await Notice.init().hideAll(payload?.authentication?.userId as string),
  }),
);

export default hideAll;

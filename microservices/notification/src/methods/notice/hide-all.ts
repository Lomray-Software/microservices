import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsNumber } from 'class-validator';
import Notice from '@services/notice';

class HideAllOutput {
  @IsBoolean()
  status: boolean;

  @IsNumber()
  @IsUndefinable()
  affected?: number;
}

/**
 * Hide all user's notifications
 */
const hideAll = Endpoint.custom(
  () => ({
    output: HideAllOutput,
    description: 'Notifications multiple hide',
  }),
  ({ payload }) => Notice.init().hideAll(payload?.authentication?.userId as string),
);

export { hideAll, HideAllOutput };

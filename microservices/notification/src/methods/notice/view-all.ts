import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsNumber } from 'class-validator';
import Notice from '@services/notice';

class ViewAllOutput {
  @IsBoolean()
  status: boolean;

  @IsNumber()
  @IsUndefinable()
  affected?: number;
}

/**
 * View all user's notifications
 */
const viewAll = Endpoint.custom(
  () => ({
    output: ViewAllOutput,
    description: 'Notifications multiple view',
  }),
  ({ payload }) => Notice.init().viewAll(payload?.authentication?.userId as string),
);

export { viewAll, ViewAllOutput };

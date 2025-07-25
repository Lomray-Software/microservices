import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import Notice from '@services/notice';

class ViewAllInput {
  @IsString()
  userId: string;
}

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
    input: ViewAllInput,
    output: ViewAllOutput,
    description: 'Notifications multiple view',
  }),
  ({ userId }) => Notice.init().viewAll(userId),
);

export { viewAll, ViewAllOutput, ViewAllInput };

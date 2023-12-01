import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsNumber } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import ActiveUsers from '@services/active-users';
import type { IActiveUsersParams } from '@services/active-users';

class ActiveUsersInput implements Omit<IActiveUsersParams, 'manager'> {
  @JSONSchema({
    description: 'Day interval',
    default: 30,
  })
  @IsNumber()
  @IsUndefinable()
  dayInterval?: number;
}

class ActiveUsersOutput {
  @IsNumber()
  count: number;
}

/**
 * Returns unique active users
 */
const activeUsers = Endpoint.custom(
  () => ({
    input: ActiveUsersInput,
    output: ActiveUsersOutput,
    description: 'Returns unique active users',
  }),
  async ({ dayInterval }) => ({ count: await ActiveUsers.init({ dayInterval }).compute() }),
);

export { activeUsers, ActiveUsersInput, ActiveUsersOutput };

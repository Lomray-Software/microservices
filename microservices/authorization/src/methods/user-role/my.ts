import { Endpoint } from '@lomray/microservice-helpers';
import { IsArray } from 'class-validator';

class UserRoleMyOutput {
  @IsArray()
  roles: string[];
}

/**
 * Get user role
 */
const my = Endpoint.custom(
  () => ({
    output: UserRoleMyOutput,
    description: 'Get roles for current user',
  }),
  ({ payload }) => ({ roles: payload?.authorization.roles }),
);

export default my;

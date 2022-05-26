import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsArray, IsString } from 'class-validator';
import EndpointHandler from '@services/endpoint-handler';

class UserRoleViewInput {
  @IsString()
  @IsUndefinable()
  userId?: string;
}

class UserRoleViewOutput {
  @IsArray()
  roles: string[];
}

/**
 * Get user role
 */
const view = Endpoint.custom(
  () => ({
    input: UserRoleViewInput,
    output: UserRoleViewOutput,
    description: 'Get roles for user or current user.',
  }),
  async ({ userId, payload }) => {
    if (!userId) {
      return { roles: payload?.authorization.roles };
    }

    const enforcer = EndpointHandler.init('no-matter', {
      userId,
    });

    return {
      roles: (await enforcer.getEnforcer().findUserRoles()).roles,
    };
  },
);

export default view;

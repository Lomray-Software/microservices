import { randomUUID } from 'crypto';
import TokenCreateReturnType from '@lomray/microservices-client-api/constants/token-return-type';
import TokenType from '@lomray/microservices-client-api/constants/token-type';
import IUser from '@lomray/microservices-client-api/interfaces/users/entities/user';
import _ from 'lodash';
import type Endpoints from '@helpers/api/endpoints';

/**
 * Users commands
 */
class UsersCommands {
  /**
   * @private
   */
  private endpoints: Endpoints;

  /**
   * @constructor
   */
  constructor(endpoints: Endpoints) {
    this.endpoints = endpoints;
  }

  /**
   * Create user and return auth token
   * 1. Create user
   * 2. Create personal auth token
   * 3. Assign role
   */
  public createUser = async (
    userFields: Record<string, any>,
    { roleAlias = 'user', isOnlyToken = true, withIdentityProvider = false } = {},
  ): Promise<{ user: IUser; token: string }> => {
    let userResponse;

    if (!isOnlyToken) {
      /**
       * Create user
       */
      userResponse = await this.endpoints.users.user.create(
        { fields: userFields },
        {
          isDirectReq: true,
        },
      );

      if (userResponse.error) {
        throw userResponse.error;
      }
    } else {
      userResponse = { result: { entity: { id: randomUUID() } } };
    }

    const { entity } = userResponse.result!;

    if (withIdentityProvider) {
      await this.endpoints.usersExtra.identityProvider.create(
        {
          fields: {
            userId: entity.id,
            provider: 'firebase',
            identifier: randomUUID(),
          },
        },
        {
          isDirectReq: true,
        },
      );
    }

    /**
     * Create personal token
     */
    const tokenResponse = await this.endpoints.authentication.token.create(
      {
        type: TokenType.personal,
        userId: entity.id,
        expirationAt: Math.round(Date.now() / 1000) + 1000000,
        returnType: TokenCreateReturnType.directly,
      },
      {
        isDirectReq: true,
      },
    );

    if (tokenResponse.error) {
      throw tokenResponse.error;
    }

    const token = tokenResponse.result!.token!;

    /**
     * Assign role
     */
    const assignResponse = await this.endpoints.authorization.userRole.assign(
      {
        fields: {
          userId: entity.id,
          roleAlias,
        },
      },
      {
        isDirectReq: true,
      },
    );

    if (assignResponse.error) {
      throw assignResponse.error;
    }

    return {
      user: entity,
      token,
    };
  };

  /**
   * Get user random fields
   */
  public getRandomFields = (): Partial<IUser> => ({
    email: `${randomUUID()}@email.com`,
    phone: `+37529${_.random(1111111, 9999999)}`,
  });
}

export default UsersCommands;

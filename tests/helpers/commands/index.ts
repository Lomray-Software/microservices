import TokenCreateReturnType from '@lomray/microservices-client-api/constants/token-return-type';
import TokenType from '@lomray/microservices-client-api/constants/token-type';
import Endpoints from '@helpers/api/endpoints';

class Commands {
  /**
   * @private
   */
  private endpoints: Endpoints;

  /**
   * @constructor
   */
  private constructor(endpoints: Endpoints) {
    this.endpoints = endpoints;
  }

  /**
   * Create instance
   */
  public static create(endpoints: Endpoints): Commands {
    return new this(endpoints);
  }

  /**
   * Create user and return auth token
   * 1. Create user
   * 2. Create personal auth token
   * 3. Assign role
   */
  public createUser = async (
    userFields: Record<string, any>,
    roleAlias = 'user',
  ): Promise<{ user: Record<string, any>; token: string }> => {
    /**
     * Create user
     */
    const userResponse = await this.endpoints.users.user.create(
      { fields: userFields },
      {
        isDirectReq: true,
      },
    );

    if (userResponse.error) {
      throw userResponse.error;
    }

    const { entity } = userResponse.result!;

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
}

export default Commands;

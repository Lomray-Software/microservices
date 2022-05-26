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

    const user = userResponse.result?.entity;

    /**
     * Create personal token
     */
    const tokenResponse = await this.endpoints.authentication.token.create(
      {
        type: 'personal',
        userId: user.id,
        expirationAt: Math.round(Date.now() / 1000) + 1000000,
      },
      {
        isDirectReq: true,
      },
    );

    if (tokenResponse.error) {
      throw tokenResponse.error;
    }

    const token = tokenResponse.result?.token;

    /**
     * Assign role
     */
    const assignResponse = await this.endpoints.authorization.userRole.assign(
      {
        fields: {
          userId: user.id,
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
      user,
      token,
    };
  };
}

export default Commands;

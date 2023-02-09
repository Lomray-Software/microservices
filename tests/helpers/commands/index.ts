import type Endpoints from '@helpers/api/endpoints';
import UsersCommands from '@helpers/commands/users';

class Commands {
  /**
   * @private
   */
  private endpoints: Endpoints;

  /**
   * Users commands
   * @private
   */
  public readonly users: UsersCommands;

  /**
   * @constructor
   */
  private constructor(endpoints: Endpoints) {
    this.endpoints = endpoints;
    this.users = new UsersCommands(endpoints);
  }

  /**
   * Create instance
   */
  public static create(endpoints: Endpoints): Commands {
    return new this(endpoints);
  }
}

export default Commands;

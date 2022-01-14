import { Microservice } from '@lomray/microservice-nodejs-lib';
import { IJsonQuery } from '@lomray/typeorm-json-query';

interface IRemoteConfigParams {
  msName: string;
  msConfigName: string;
}

/**
 * Get config from configuration microservice
 */
class RemoteConfig {
  /**
   * @type {RemoteConfig}
   * @protected
   */
  protected static instance: RemoteConfig;

  /**
   * @private
   */
  private ms: Microservice;

  /**
   * @private
   */
  private params: IRemoteConfigParams;

  /**
   * Cached configs
   * @private
   */
  private configs: Record<string, any> = {};

  /**
   * @protected
   */
  protected constructor(ms: Microservice, params: IRemoteConfigParams) {
    this.ms = ms;
    this.params = params;
  }

  /**
   * Create service instance
   */
  static create(ms: Microservice, params: IRemoteConfigParams): RemoteConfig {
    if (!RemoteConfig.instance) {
      RemoteConfig.instance = new RemoteConfig(ms, params);
    }

    return RemoteConfig.instance;
  }

  /**
   * Get service instance
   */
  static getInstance(): RemoteConfig {
    if (!RemoteConfig.instance) {
      throw new Error('Remote config service should be instantiated before obtain config.');
    }

    return RemoteConfig.instance;
  }

  /**
   * Get cached config synchronously
   */
  static getSync<TParams = Record<string, any> | undefined>(paramName: string): TParams | null {
    const self = RemoteConfig.getInstance();

    if (self.configs[paramName]) {
      return self.configs[paramName];
    }

    return null;
  }

  /**
   * Get remote config
   */
  static async get<TParams = Record<string, any> | undefined>(
    paramName: string,
    options?: { isForce?: boolean; isThrowNotExist?: boolean },
  ): Promise<TParams> {
    const { isForce = false, isThrowNotExist = false } = options ?? {};
    const self = RemoteConfig.getInstance();
    const cachedConfig = RemoteConfig.getSync<TParams>(paramName);

    if (!isForce && cachedConfig !== null) {
      return cachedConfig;
    }

    const { msName, msConfigName } = self.params;

    const config = await self.ms.sendRequest<{ query: IJsonQuery }>(`${msConfigName}.view`, {
      query: {
        where: { type: paramName, or: [{ microservice: msName }, { microservice: '*' }] },
      },
    });

    if (config.getError()) {
      throw config.getError();
    }

    const result = config.getResult()?.params;

    if (!result && isThrowNotExist) {
      throw new Error(`Configuration for param "${paramName}" doesn't exist.`);
    }

    return (self.configs[paramName] = result);
  }
}

export default RemoteConfig;

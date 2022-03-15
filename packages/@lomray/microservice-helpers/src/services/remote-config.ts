import { AbstractMicroservice } from '@lomray/microservice-nodejs-lib';
import { IJsonQuery } from '@lomray/typeorm-json-query';
import { IsBoolean } from 'class-validator';
import { Endpoint } from '@services/endpoint';

interface IRemoteConfigParams {
  msName: string;
  msConfigName: string;
  resetCacheEndpoint?: string;
}

class RemoteConfigOutput {
  @IsBoolean()
  isReset: boolean;
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
  private readonly ms: AbstractMicroservice;

  /**
   * @private
   */
  private readonly params: IRemoteConfigParams;

  /**
   * Cached configs
   * @private
   */
  private configs: Record<string, any> = {};

  /**
   * @protected
   */
  protected constructor(ms: AbstractMicroservice, params: IRemoteConfigParams) {
    this.ms = ms;
    this.params = params;

    this.addResetCacheEndpoint();
  }

  /**
   * Init service instance
   */
  static init(ms: AbstractMicroservice, params: IRemoteConfigParams): void {
    if (!RemoteConfig.instance) {
      RemoteConfig.instance = new RemoteConfig(ms, params);
    }
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
   * Add endpoint for reset config cache
   * @private
   */
  private addResetCacheEndpoint() {
    const { resetCacheEndpoint = 'config-reset' } = this.params;

    this.ms.addEndpoint(
      resetCacheEndpoint,
      Endpoint.custom(
        () => ({ output: RemoteConfigOutput, description: 'Reset RemoteConfig cache' }),
        () => {
          this.configs = {};

          return { isReset: true };
        },
      ),
    );
  }

  /**
   * Get cached config synchronously
   */
  static getCachedSync<TParams = Record<string, any> | undefined>(
    paramName: string,
  ): TParams | null {
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
    options?: { isForce?: boolean; isThrowNotExist?: boolean; isCommon?: boolean },
  ): Promise<TParams> {
    const { isForce = false, isThrowNotExist = false, isCommon = false } = options ?? {};
    const self = RemoteConfig.getInstance();
    const cachedConfig = RemoteConfig.getCachedSync<TParams>(paramName);

    if (!isForce && cachedConfig !== null) {
      return cachedConfig;
    }

    const { msName, msConfigName } = self.params;

    const config = await self.ms.sendRequest<{ query: IJsonQuery }>(`${msConfigName}.config.view`, {
      query: {
        where: {
          type: paramName,
          or: [{ microservice: msName }, ...(isCommon ? [{ microservice: '*' }] : [])],
        },
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

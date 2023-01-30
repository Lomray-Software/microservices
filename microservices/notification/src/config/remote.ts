import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  defaultEmailFrom: CONST.EMAIL_DEFAULT_FROM,
  emailProvider: CONST.EMAIL_PROVIDER as IRemoteConfig['emailProvider'],
  transportOptions: CONST.EMAIL_TRANSPORTER_OPTIONS as IRemoteConfig['transportOptions'],
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) } as Required<IRemoteConfig>;
};

export default remoteConfig;

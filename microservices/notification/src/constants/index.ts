import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import EmailProvider from '@constants/email-provider';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'notification';

const constants = {
  ...GetConstants({
    msNameDefault,
    version,
    isBuild,
    packageName: name,
    withDb: true,
    withAWS: true,
  }),
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER ?? EmailProvider.SIMPLE,
  EMAIL_DEFAULT_FROM: process.env.EMAIL_DEFAULT_FROM,
  EMAIL_TRANSPORTER_OPTIONS: process.env.EMAIL_FROM_CONFIG_MS || '{}',
  IS_EMAIL_FROM_CONFIG_MS: Boolean(Number(process.env.EMAIL_FROM_CONFIG_MS ?? 1)),
};

export default constants;

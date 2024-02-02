import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'users';

const constants = {
  ...GetConstants({
    msNameDefault,
    version,
    isBuild,
    packageName: name,
    withDb: true,
    withFirebase: true,
  }),
  MS_USER_PASSWORD_SALT_ROUNDS: Number(process.env.MS_USER_PASSWORD_SALT_ROUNDS) || 10,
  MS_USER_REMOVE_ACCOUNT_RESTORE_TIME: Number(process.env.MS_USER_REMOVE_ACCOUNT_RESTORE_TIME) || 0,
  MS_USER_CHANGE_PASSWORD_CLEAR_TOKENS_TYPE:
    process.env.MS_USER_CHANGE_PASSWORD_CLEAR_TOKENS_TYPE || 'none',
};

export default constants;

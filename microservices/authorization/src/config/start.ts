import childProcess from 'child_process';
import { GetMsStartConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import registerMethods from '@methods/index';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'microservice',
  registerMethods,
  hooks: {
    afterCreateMicroservice: () => {
      if (CONST.MS_IMPORT_PERMISSION) {
        childProcess.execSync(`npm run permissions:import:${CONST.IS_BUILD ? 'prod' : 'dev'}`, {
          stdio: 'inherit',
        });
      }
    },
  },
});

export default startConfig;

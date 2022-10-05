import { startWithDb } from '@lomray/microservice-helpers';
import startConfig from '@config/start';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default startWithDb(startConfig);

import type { ITracerConfig } from '@lomray/microservice-helpers/helpers/tracer';
import * as constants from '@constants/index';
import { version } from '../../package.json';

/**
 * Tracer config
 */
const tracer: ITracerConfig = { ...constants, version };

export default tracer;

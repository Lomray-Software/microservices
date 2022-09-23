import tracer from '@lomray/microservice-helpers/helpers/tracer';
import { version } from '../package.json';
import * as constants from './constants';

export default tracer({ ...constants, version, isGateway: true });

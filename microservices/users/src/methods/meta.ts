import { Endpoint, MicroserviceMeta, MicroserviceMetaOutput } from '@lomray/microservice-helpers';
import { msOptions } from '@config/ms';

/**
 * Get microservice metadata
 */
const meta = Endpoint.custom(
  () => ({ output: MicroserviceMetaOutput, description: 'Get microservice metadata' }),
  (_, { app }) => MicroserviceMeta.getMeta(app.getEndpoints(), msOptions.version),
);

export default meta;

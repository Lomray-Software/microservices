import { Endpoint, MicroserviceMeta, MicroserviceMetaOutput } from '@lomray/microservice-helpers';

/**
 * Get microservice metadata
 */
const meta = Endpoint.custom(
  () => ({ output: MicroserviceMetaOutput, description: 'Get microservice metadata' }),
  (_, { app }) => MicroserviceMeta.getMeta(app.getEndpoints()),
);

export default meta;

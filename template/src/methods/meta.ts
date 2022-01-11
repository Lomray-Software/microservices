import { Endpoint, MicroserviceMeta, MicroserviceMetaOutput } from '@lomray/microservice-helpers';

/**
 * Get microservice metadata
 */
const meta = Endpoint.custom(
  () => ({ output: MicroserviceMetaOutput }),
  (_, { app }) => MicroserviceMeta.getMeta(app.getEndpoints()),
);

export default meta;

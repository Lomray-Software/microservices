import { MicroserviceMetaOutput, Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ComponentRepository from '@repositories/component';
import SingleTypeRepository from '@repositories/single-type';
import SingleTypeMeta from '@services/single-type-meta';

/**
 * Get microservice metadata
 */
const meta = Endpoint.custom(
  () => ({ output: MicroserviceMetaOutput, description: 'Get microservice metadata' }),
  (_, { app }) =>
    SingleTypeMeta.init({
      singleTypeRepository: getCustomRepository(SingleTypeRepository),
      componentRepository: getCustomRepository(ComponentRepository),
    }).endpointHandler(app),
);

export default meta;

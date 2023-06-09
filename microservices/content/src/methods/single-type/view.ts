import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository, getRepository } from 'typeorm';
import SingleTypeEntity from '@entities/single-type';
import { IExpandRouteInput } from '@interfaces/expand-route';
import ComponentRepository from '@repositories/component';
import SingleTypeRepository from '@repositories/single-type';
import SingleTypeViewProcess from '@services/single-type-view-process';

/**
 * View file entity
 */
const view = Endpoint.view(
  () => ({
    repository: getRepository(SingleTypeEntity),
    description: 'View single type with expand relations',
  }),
  async (typeQuery, params) => {
    const { entity } = await Endpoint.defaultHandler.view(typeQuery.toQuery());
    const relations = params?.payload?.expand as IExpandRouteInput[];

    if (!relations?.length) {
      return {
        entity,
      };
    }

    const componentRepository = getCustomRepository(ComponentRepository);
    const singleTypeRepository = getCustomRepository(SingleTypeRepository);

    return {
      entity: await SingleTypeViewProcess.init({
        entity,
        componentRepository,
        singleTypeRepository,
      }).expand(relations),
    };
  },
);

export default view;

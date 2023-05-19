import { EntityRepository, getRepository, Repository } from 'typeorm';
import ComponentEntity from '@entities/component';
import isComponent from '@helpers/guards/is-component';
import { IRelationSchema } from '@interfaces/component';
import IComponentRoute from '@interfaces/component-route';
import IExpandRoute from '@interfaces/expand-route';

/**
 *  Component repository
 */
@EntityRepository(ComponentEntity)
class Component extends Repository<ComponentEntity> {
  /**
   * Handle search input relations
   */
  public async handleRelations({
    componentId,
    componentDataName: inputName,
    route,
  }: IComponentRoute): Promise<IExpandRoute | null> {
    const repository = getRepository(ComponentEntity);

    const component = await repository.findOne(componentId);

    if (!isComponent(component)) {
      return null;
    }

    const input = component.schema?.find(({ name }) => name === inputName) as IRelationSchema;

    if (!input) {
      return null;
    }

    const {
      relation: { microservice, entity },
    } = input;

    return {
      route,
      microservice,
      entity,
    };
  }

  /**
   * Returns related components by single-type id
   */
  public getRelatedComponentBySingleTypeId(id: string): Promise<ComponentEntity[]> {
    const repository = getRepository(ComponentEntity);

    return repository
      .createQueryBuilder('component')
      .innerJoin('component.singleTypes', 'singleType')
      .where('singleType.id = :id', { id })
      .getMany();
  }

  /**
   * Returns related children components by id
   */
  public getChildrenComponentById(id: string): Promise<ComponentEntity[]> {
    const componentRepository = getRepository(ComponentEntity);

    return componentRepository
      .createQueryBuilder('component')
      .leftJoinAndSelect('component.children', 'child')
      .where('component.id = :id', { id })
      .getMany();
  }
}

export default Component;

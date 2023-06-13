import { EntityRepository, getRepository, Repository } from 'typeorm';
import ComponentEntity from '@entities/component';
import isComponent from '@helpers/guards/is-component';
import type { IRelationSchema } from '@interfaces/component';
import type IComponentRoute from '@interfaces/component-route';
import type { IExpandRoute } from '@interfaces/expand-route';

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
    name,
    hasMany,
    attributes,
    relations,
    isOptional,
  }: IComponentRoute): Promise<IExpandRoute | null> {
    const repository = getRepository(ComponentEntity);

    const component = await repository.findOne(componentId);

    if (!isComponent(component)) {
      return null;
    }

    const input = component.schema?.find(
      ({ name: cName }) => cName === inputName,
    ) as IRelationSchema;

    if (!input) {
      return null;
    }

    const {
      relation: { microservice, entity },
    } = input;

    return {
      name,
      microservice,
      entity,
      hasMany,
      relations,
      attributes,
      isOptional,
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

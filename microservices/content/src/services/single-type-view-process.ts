import { BaseException } from '@lomray/microservice-nodejs-lib';
import SingleTypeEntity from '@entities/single-type';
import getExpandRouteProperties from '@helpers/get-expand-route-properties';
import IComponentRoute from '@interfaces/component-route';
import IExpandRoute from '@interfaces/expand-route';
import ComponentRepository from '@repositories/component';
import SingleTypeRepository from '@repositories/single-type';

class ISingleTypeViewProcessInputParams {
  entity: SingleTypeEntity;
  componentRepository: ComponentRepository;
  singleTypeRepository: SingleTypeRepository;
}

/**
 * Single-type view process service
 */
class SingleTypeViewProcess {
  /**
   * @protected
   */
  protected readonly entity: ISingleTypeViewProcessInputParams['entity'];

  /**
   * @protected
   */
  protected readonly componentRepository: ISingleTypeViewProcessInputParams['componentRepository'];

  /**
   * @protected
   */
  protected readonly singleTypeRepository: ISingleTypeViewProcessInputParams['singleTypeRepository'];

  /**
   * @constructor
   */
  protected constructor({
    entity,
    componentRepository,
    singleTypeRepository,
  }: ISingleTypeViewProcessInputParams) {
    this.entity = entity;
    this.componentRepository = componentRepository;
    this.singleTypeRepository = singleTypeRepository;
  }

  /**
   * Init service
   */
  static init(params: ISingleTypeViewProcessInputParams): SingleTypeViewProcess {
    return new SingleTypeViewProcess(params);
  }

  /**
   * Handle expand flow
   */
  public async expand(relations: string[]): Promise<SingleTypeEntity> {
    const expandRoutes = await this.constructExpandRoutes(relations);

    const expandRequests = expandRoutes.map((expandRoute) => this.handleExpand(expandRoute));

    await Promise.all(expandRequests);

    return this.entity;
  }

  /**
   * Returns entity with an expanded data
   */
  private async handleExpand({
    route,
    entity,
    microservice,
    hasMany,
  }: IExpandRoute): Promise<void> {
    const property = getExpandRouteProperties(route).properties.pop();
    const data = this.singleTypeRepository.getDataAtPath(this.entity, route, hasMany);

    /**
     * If no data for expand return original single type
     */
    if (!data || !property) {
      return;
    }

    if (typeof data === 'string') {
      throw new BaseException({
        status: 400,
        message: 'Single type expected to expand data should contain primary keys of entity.',
      });
    }

    const expandEntityData: Record<string, unknown>[] = Array.isArray(data) ? data : [data];

    let entitiesResult: unknown[];

    if (hasMany) {
      const entitiesIds = this.extractDataByProperty(expandEntityData, property);

      entitiesResult = await SingleTypeRepository.getMicroserviceData(
        entitiesIds,
        microservice,
        entity,
      );
    } else {
      entitiesResult = await SingleTypeRepository.getMicroserviceData(
        expandEntityData,
        microservice,
        entity,
      );
    }

    this.singleTypeRepository.setDataAtPath({
      data: entitiesResult,
      singleType: this.entity,
      path: route,
      hasMany,
    });
  }

  /**
   * Extract data from array according property name
   */
  private extractDataByProperty(data: Record<string, unknown>[], property: string): unknown[] {
    return data.reduce((values: unknown[], obj) => {
      if (obj.hasOwnProperty(property)) {
        const propertyValue = obj[property] as string[];

        if (Array.isArray(propertyValue)) {
          values = [...values, ...propertyValue];
        } else {
          values = [...values, propertyValue];
        }
      }

      return values;
    }, []);
  }

  /**
   * Construct component routes
   */
  private constructComponentRoutes(relations: string[]): IComponentRoute[] {
    return relations.map((relation) => {
      const properties = relation.split('.');

      // Destruct data from relation route
      const componentDataName = properties.pop();
      const componentAlias = properties.pop();

      if (!componentAlias || !componentDataName) {
        throw new BaseException({
          status: 400,
          message: 'Failed to get relation data. Incorrectly built relation routes',
        });
      }

      const component = this.singleTypeRepository.getDataAtPath<object>(this.entity, properties);

      if (!component || !component?.hasOwnProperty(componentAlias)) {
        throw new BaseException({
          status: 400,
          message:
            "Failed to get component data because it doesn't exist according to the passed relationship routes",
        });
      }

      const componentId = component[componentAlias]?.id as string;
      const hasMany = Array.isArray(component[componentAlias]?.data);

      return {
        componentId,
        componentDataName,
        route: relation,
        hasMany,
      };
    });
  }

  /**
   * Construct expand routes
   */
  private async constructExpandRoutes(relations: string[]): Promise<IExpandRoute[]> {
    const componentRoutes = this.constructComponentRoutes(relations);

    const expandRoutesRequests = componentRoutes.map((componentRoute) =>
      this.componentRepository.handleRelations(componentRoute),
    );

    const expandRoutes = await Promise.all(expandRoutesRequests);
    const verifiedExpandRoutes = expandRoutes.filter(Boolean) as IExpandRoute[];

    if (verifiedExpandRoutes.length !== relations.length) {
      throw new BaseException({
        status: 400,
        message:
          'Failed to get one or more expanded routes according to the provided relationship routes.',
      });
    }

    return verifiedExpandRoutes;
  }
}

export default SingleTypeViewProcess;

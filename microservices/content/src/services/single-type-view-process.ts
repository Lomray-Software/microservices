import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import SingleTypeEntity from '@entities/single-type';
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
   * Returns requested data from microservice
   */
  private async getMicroserviceData<T = unknown>(
    dataIds: string[],
    microservice: string,
    entity: string,
  ): Promise<T[]> {
    // const query = {
    //   where: {
    //     or: Array.isArray(expandEntityData) ? expandEntityData : [expandEntityData],
    //   },
    // };

    const query = {
      where: {
        id: {
          in: dataIds,
        },
      },
    };

    const { result, error } = await Api.get()[microservice][entity].list({ query });

    if (error || !result?.list) {
      const errorMsg = `Failed to get data for expand entity in ${microservice} microservice of ${entity} entity`;

      Log.error(errorMsg, error);

      throw new BaseException({
        status: 500,
        message: errorMsg,
        payload: error,
      });
    }

    return result?.list;
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
    if (hasMany) {
      const expandEntityData = this.singleTypeRepository.getDataAtPath<string[]>(
        this.entity,
        route,
        hasMany,
      );

      const property = route.split('.').pop();

      if (!expandEntityData || !property) {
        return;
      }

      const dataIds = this.extractDataByProperty(expandEntityData, property);
      const result = await this.getMicroserviceData(dataIds, microservice, entity);

      this.singleTypeRepository.setDataAtPath(this.entity, route, result, hasMany);

      return;
    }

    const expandEntityData = this.singleTypeRepository.getDataAtPath(this.entity, route);

    if (!expandEntityData) {
      return;
    }

    const entitiesResult = await this.getMicroserviceData(
      expandEntityData as string[],
      microservice,
      entity,
    );

    this.singleTypeRepository.setDataAtPath(this.entity, route, entitiesResult);
  }

  /**
   * Extract data from array according property name
   */
  private extractDataByProperty(data: string[], property: string): string[] {
    return data.reduce((values: string[], obj) => {
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
          'Failed to get one or more expanded routes according to the passed relationship routes',
      });
    }

    return verifiedExpandRoutes;
  }
}

export default SingleTypeViewProcess;

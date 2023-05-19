import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { getCustomRepository } from 'typeorm';
import SingleTypeEntity from '@entities/single-type';
import IComponentRoute from '@interfaces/component-route';
import IExpandData from '@interfaces/expand-data';
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
   * Returns entity with an expanded data
   */
  private async getExpandData({ route, entity, microservice }: IExpandRoute): Promise<IExpandData> {
    const expandEntityData = this.singleTypeRepository.getDataAtPath(this.entity, route);

    if (!expandEntityData) {
      return { data: null, routeRef: route };
    }

    const query = {
      where: {
        id: {
          in: expandEntityData,
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

    return { data: result.list, routeRef: route };
  }

  /**
   * Returns matched expand data by route reference
   */
  private findExpandDataByRouteRef<T = unknown>(
    expandData: IExpandData[],
    route: string,
  ): T | null {
    return (expandData.find(({ routeRef }) => routeRef === route)?.data || null) as T | null;
  }

  /**
   * Set expand data by route
   */
  private setExpandData<T = unknown>(route: string, data: T): void {
    const repository = getCustomRepository(SingleTypeRepository);

    repository.setDataAtPath(this.entity, route, data);
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

      return {
        componentId,
        componentDataName,
        route: relation,
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

  /**
   * Handle expand flow
   */
  public async expand(relations: string[]): Promise<SingleTypeEntity> {
    const expandRoutes = await this.constructExpandRoutes(relations);

    const expandRequests = expandRoutes.map((expandRoute) => this.getExpandData(expandRoute));
    const expandData = await Promise.all(expandRequests);

    expandRoutes.map(({ route }) =>
      this.setExpandData(route, this.findExpandDataByRouteRef(expandData, route)),
    );

    return this.entity;
  }
}

export default SingleTypeViewProcess;

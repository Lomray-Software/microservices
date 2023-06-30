import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityRepository, Repository } from 'typeorm';
import SingleTypeEntity, { ISingleTypeValue } from '@entities/single-type';
import getExpandRouteProperties from '@helpers/get-expand-route-properties';
import replaceEntities from '@helpers/replace-entities';

interface ISetDataAtPath {
  singleType: SingleTypeEntity;
  path: string;
  data: unknown[];
  hasMany?: boolean;
}

/**
 *  Single-type repository
 */
@EntityRepository(SingleTypeEntity)
class SingleType extends Repository<SingleTypeEntity> {
  /**
   * Returns single-type relation value by path
   */
  public getDataAtPath<T = unknown>(
    { value }: SingleTypeEntity,
    path: string | string[],
    hasMany = false,
  ): T | null {
    const getData = (routes: string[]) =>
      routes.reduce((resp, property) => {
        if (resp.hasOwnProperty(property)) {
          return resp[property]?.data || resp[property];
        }

        return hasMany ? resp : null;
      }, value);

    return Array.isArray(path) ? getData(path) : getData(getExpandRouteProperties(path).properties);
  }

  /**
   * Returns new single-type with the expanded data
   */
  public setDataAtPath = ({ singleType: { value }, data, hasMany, path }: ISetDataAtPath): void => {
    const { properties, lastIndex } = getExpandRouteProperties(path);

    properties.forEach((property, index) => {
      if (index !== lastIndex) {
        return (value = value[property]?.data ?? (value[property] = {}));
      }

      if (hasMany) {
        return (value = this.replaceRelationIdsOnEntities(data, value, property)!);
      }

      value[property] = data;
    });
  };

  /**
   * Replace relation ids from value on according provided entities
   */
  private replaceRelationIdsOnEntities(
    data: unknown[],
    value: ISingleTypeValue,
    property: string,
  ): ISingleTypeValue | void {
    if (!Array.isArray(value)) {
      return value;
    }

    value.forEach((input) => {
      if (!input.hasOwnProperty(property)) {
        return;
      }

      input[property] = replaceEntities(
        input[property] as Record<string, unknown>[],
        data as Record<string, unknown>[],
      );
    });
  }

  /**
   * Returns requested data from microservice
   */
  public static async getMicroserviceData<T = unknown>(
    entities: unknown[],
    microservice: string,
    entity: string,
    attributes?: string[],
    relations?: string[],
    isOptional = false,
  ): Promise<T[]> {
    const query = {
      ...(attributes ? { attributes } : {}),
      ...(relations ? { relations } : {}),
      where: {
        or: (Array.isArray(entities) ? entities : [entities]).filter(Boolean),
      },
    };

    const { result, error } = await Api.get()[microservice][entity].list({ query });

    if ((error || !result?.list) && !isOptional) {
      const errorMsg = `Failed to get data for expand entity in ${microservice} microservice of ${entity} entity`;

      Log.error(errorMsg, error);

      throw new BaseException({
        status: 500,
        message: errorMsg,
        payload: error,
      });
    }

    return result?.list ?? [];
  }
}

export default SingleType;

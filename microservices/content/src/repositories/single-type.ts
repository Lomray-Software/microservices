import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityRepository, Repository } from 'typeorm';
import SingleTypeEntity, { ISingleTypeValue } from '@entities/single-type';

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

    return Array.isArray(path) ? getData(path) : getData(path.split('.'));
  }

  /**
   * Returns new single-type with the expanded data
   */
  public setDataAtPath = <TData = unknown>(
    { value }: SingleTypeEntity,
    path: string,
    data: TData,
    hasMany = false,
  ): void => {
    const properties = path.split('.');
    const lastIdx = properties.length - 1;

    properties.forEach((property, index) => {
      if (index !== lastIdx) {
        return (value = value[property]?.data ?? (value[property] = {}));
      }

      if (hasMany && Array.isArray(data) && Array.isArray(data)) {
        return (value = this.replaceRelationIdsOnEntities(data, value, property));
      }

      value[property] = data;
    });
  };

  /**
   * Replace relation ids from value on according provided entities
   */
  private replaceRelationIdsOnEntities(
    data: { id: string }[],
    value: ISingleTypeValue,
    property: string,
  ): ISingleTypeValue {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.map((input) => {
      if (!input.hasOwnProperty(property)) {
        throw new BaseException({
          status: 500,
          message: `Invalid object format. "${property}" property does not exist in "value" objects.`,
        });
      }

      const ids = input[property];

      input[property] = ids.map((id: string) => {
        const entity = data.find((entry) => entry.id === id);

        if (!entity) {
          return input[property]?.id;
        }

        return entity;
      });

      return input;
    });
  }
}

export default SingleType;

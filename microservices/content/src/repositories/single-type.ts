import { EntityRepository, Repository } from 'typeorm';
import SingleTypeEntity from '@entities/single-type';

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
  ): T | null {
    const getData = (routes: string[]) =>
      routes.reduce(
        (resp, property) =>
          resp.hasOwnProperty(property) ? resp[property]?.data || resp[property] : null,
        value,
      );

    return Array.isArray(path) ? getData(path) : getData(path.split('.'));
  }

  /**
   * Returns new single-type with the expanded data
   */
  public setDataAtPath = <T = unknown>(
    { value }: SingleTypeEntity,
    path: string,
    data: T,
  ): void => {
    const properties = path.split('.');
    const lastIdx = properties.length - 1;

    properties.forEach((property, index) => {
      if (index !== lastIdx) {
        return (value = value[property]?.data ?? (value[property] = {}));
      }

      value[property] = data;
    });
  };
}

export default SingleType;

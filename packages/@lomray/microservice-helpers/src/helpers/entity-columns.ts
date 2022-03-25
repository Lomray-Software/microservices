import type { Repository } from 'typeorm';

/**
 * Get entity columns
 * @constructor
 */
const EntityColumns = <T>(repository: Repository<T>): (keyof T)[] =>
  repository.metadata.columns.map((col) => col.propertyName) as (keyof T)[];

export default EntityColumns;

/**
 * Returns replaced entities data from original array by update array data
 * NOTE: Data that wasn't updated will return in the original state
 */
const replaceEntities = <TEntity = unknown>(
  originalEntities: Record<string, unknown>[],
  updatedEntities: Record<string, TEntity>[],
  isShouldRemoveNotMatchingRecord = true,
): Record<string, TEntity | unknown>[] => {
  /**
   * Extract original primary keys
   */
  const originalPrimaryKeys = Object.keys(originalEntities[0]);

  /**
   * Lookup using concatenated primary key values as keys
   */
  const dictionary = new Map<string, Record<string, TEntity>>();

  for (const updatedEntity of updatedEntities) {
    const key = originalPrimaryKeys.map((primaryKey) => updatedEntity[primaryKey]).join('/');

    dictionary.set(key, updatedEntity);
  }

  let updatedOriginalEntities: Record<string, TEntity | unknown>[] = [];

  // Iterate over the original entities
  for (const originalEntity of originalEntities) {
    const key = originalPrimaryKeys.map((primaryKey) => originalEntity[primaryKey]).join('/');

    if (dictionary.has(key)) {
      /**
       * Replace matching items
       */
      const updatedEntity = dictionary.get(key);

      Object.assign(originalEntity, updatedEntity);
      updatedOriginalEntities = [...updatedOriginalEntities, originalEntity];
    } else if (!isShouldRemoveNotMatchingRecord) {
      /**
       * Keep original entity if no matching item found
       */
      updatedOriginalEntities = [...updatedOriginalEntities, originalEntity];
    }
  }

  return updatedOriginalEntities;
};

export default replaceEntities;

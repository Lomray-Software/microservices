/**
 * Method filter operator
 */
export enum FilterOperator {
  /**
   * Only for the specified role
   */
  only = 'only',
  /**
   * For all nested roles
   */
  and = 'and',
}

/**
 * Filter type for filter fields
 */
export enum FilterType {
  IN = 'in',
  OUT = 'out',
}

export enum FilterIgnoreType {
  only = 'only',
  stop = 'stop',
}

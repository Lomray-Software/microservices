import { IJsonQueryWhere } from '@lomray/microservices-types';
import _ from 'lodash';
import { FilterOperator } from '@constants/filter';
import Filter from '@entities/filter';
import MethodFiltersEntity from '@entities/method-filter';

export interface IMethodFiltersParams {
  userRoles: string[];
  templateOptions: Record<string, any>;
}

/**
 * Collect filters for method according to user role
 */
class MethodFilters {
  /**
   * @private
   */
  private readonly userRoles: IMethodFiltersParams['userRoles'];

  /**
   * @private
   */
  private readonly templateOptions: IMethodFiltersParams['templateOptions'];

  /**
   * @protected
   * @constructor
   */
  protected constructor({ userRoles, templateOptions }: IMethodFiltersParams) {
    this.userRoles = userRoles;
    this.templateOptions = templateOptions;
  }

  /**
   * Init filter
   */
  static init(params: IMethodFiltersParams): MethodFilters {
    return new MethodFilters(params);
  }

  /**
   * Collect filters
   */
  getFilters(filters: MethodFiltersEntity[]): IJsonQueryWhere {
    const filter: IJsonQueryWhere = {};

    if (filters.length === 0) {
      return filter;
    }

    const filtersByRoles = _.keyBy(filters, 'roleAlias');
    const userRole = this.getUserRole();
    const roles = [...this.userRoles].reverse();

    for (const role of roles) {
      const roleFilter = filtersByRoles[role];

      if (!roleFilter) {
        continue;
      }

      // direct role filter
      if (roleFilter.operator === FilterOperator.only) {
        if (userRole === role) {
          return this.getCondition(roleFilter.filter);
        }

        continue;
      }

      if (!filter[roleFilter.operator]) {
        filter[roleFilter.operator] = [];
      }

      filter[roleFilter.operator].push(this.getCondition(roleFilter.filter));
    }

    return filter;
  }

  /**
   * Template and return filter condition
   * @private
   */
  private getCondition(filter: Filter): IJsonQueryWhere {
    const { condition } = filter;
    const [templateVariables, simpleTypeFieldNames] = this.getTemplateVariables({
      ...this.templateOptions,
      userRole: this.getUserRole(),
      timestamp: Math.floor(Date.now() / 1000),
      datetime: new Date().toISOString(),
    });
    const stringCondition = JSON.stringify(condition)
      /**
       * Replace double quotes to one for simple types. E.g.:
       *
       * from: '{"field1":"{{ userId }}","field2":"some {{ userId }} body"}'
       * to: '{"field1":{{ userId }},"field2":"some {{ userId }} body"}'
       *
       * for keep original types
       */
      .replace(new RegExp(`(:)"({{ (${simpleTypeFieldNames.join('|')}) }})"`, 'g'), '$1$2');

    const templatedCondition = _.template(stringCondition, {
      // Use custom template delimiters. E.g.: {{ userId }}
      interpolate: /{{([\s\S]+?)}}/g,
    })(templateVariables);

    return JSON.parse(templatedCondition);
  }

  /**
   * Get direct user role
   * @private
   */
  private getUserRole(): string {
    return this.userRoles[0];
  }

  /**
   * Get template name simple variable types
   * Convert null values to string (because lodash template return empty string without null)
   * @private
   */
  private getTemplateVariables(
    variables: Record<string, any>,
    prefix?: string,
  ): [Record<string, any>, string[]] {
    const simpleTypeNames: string[] = [];
    const resultVariables = {};

    for (const [name, value] of Object.entries<Record<string, any>>(variables)) {
      const variableType = typeof value;

      if (['number', 'boolean', 'bigint'].includes(variableType) || value === null) {
        resultVariables[name] = value === null ? 'null' : value;
        simpleTypeNames.push(prefix ? [prefix, name].join('.') : name);
      } else if (variableType === 'object') {
        const [nestedVariables, nestedNames] = this.getTemplateVariables(value, name);

        resultVariables[name] = nestedVariables;
        simpleTypeNames.push(...nestedNames);
      } else {
        resultVariables[name] = value;
      }
    }

    return [resultVariables, simpleTypeNames];
  }
}

export default MethodFilters;

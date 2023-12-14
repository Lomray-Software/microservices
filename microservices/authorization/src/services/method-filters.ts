import type { IJsonQuery } from '@lomray/microservices-types';
import { JQJunction } from '@lomray/microservices-types';
import { FilterIgnoreType, FilterOperator } from '@constants/filter';
import Filter from '@entities/filter';
import MethodFiltersEntity from '@entities/method-filter';
import Templater from '@services/templater';

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
  public getFilters(filters: MethodFiltersEntity[]): Filter['condition'] {
    const condition = this.getConditionInitState();

    if (filters.length === 0) {
      return condition;
    }

    const userRole = this.getUserRole();
    const roles = [...this.userRoles].reverse();
    const filtersByRoles = filters.reduce(
      (res, methodFilter) => ({
        [methodFilter.roleAlias]: [
          ...(res[methodFilter.roleAlias] ?? []),
          ...(this.isFilterIgnored(methodFilter.filter.ignore, this.userRoles)
            ? []
            : [methodFilter]),
        ],
        ...res,
      }),
      {} as Record<string, MethodFiltersEntity[]>,
    );

    for (const role of roles) {
      const roleFilters = filtersByRoles[role] ?? [];

      if (!roleFilters.length) {
        continue;
      }

      for (const roleFilter of roleFilters) {
        const {
          operator,
          filter: {
            condition: { query, options, methodOptions },
          },
        } = roleFilter;

        // skip apply filter, because filter have direct role
        if (operator === FilterOperator.only && role !== userRole) {
          continue;
        }

        if (options) {
          condition.options = { ...condition.options, ...options };
        }

        if (methodOptions) {
          condition.methodOptions = { ...condition.methodOptions, ...methodOptions };
        }

        if (!condition.query) {
          condition.query = {};
        }

        this.mergeConditions(condition.query, this.getCondition(query));
      }
    }

    return condition;
  }

  /**
   * Returns condition init state
   * @description Compose payload filters with condition default state
   */
  private getConditionInitState(): Filter['condition'] {
    const payloadMethodOptions =
      this.templateOptions?.fields?.payload?.authorization?.filter?.methodOptions;

    return {
      // Set as default authorization filter method options
      ...(payloadMethodOptions ? { methodOptions: payloadMethodOptions } : {}),
    };
  }

  /**
   * Check is filter should be ignored
   * @private
   */
  private isFilterIgnored(
    ignore: MethodFiltersEntity['filter']['ignore'],
    roles: string[],
  ): boolean {
    // skip apply filter, because role ignored
    if (ignore?.[this.getUserRole()]) {
      return true;
    }

    // skip apply filter, because parent role ignored and prevent propagation
    return roles.some((role) => ignore?.[role] === FilterIgnoreType.stop);
  }

  /**
   * Merge filter conditions
   * @private
   */
  private mergeConditions(baseQuery: IJsonQuery, mergeQuery: IJsonQuery): void {
    const operator: string = JQJunction.and;

    if (!baseQuery.where?.[operator] && mergeQuery.where) {
      baseQuery.where = { [operator]: [] };
    }

    if (mergeQuery.attributes) {
      baseQuery.attributes = [...(baseQuery.attributes ?? []), ...mergeQuery.attributes];
    }

    if (mergeQuery.relations) {
      baseQuery.relations = [...(baseQuery.relations ?? []), ...mergeQuery.relations];
    }

    if (mergeQuery.where) {
      baseQuery.where![operator].push(mergeQuery.where);
    }

    if (mergeQuery.groupBy) {
      baseQuery.groupBy = [...(baseQuery.groupBy ?? []), ...mergeQuery.groupBy];
    }
  }

  /**
   * Template and return filter condition
   * @private
   */
  private getCondition(query?: IJsonQuery): IJsonQuery {
    if (!query) {
      return {};
    }

    const [templateVariables, simpleTypeFieldNames] = this.getTemplateVariables({
      ...this.templateOptions,
      userRole: this.getUserRole(),
    });
    const stringCondition = JSON.stringify(query)
      /**
       * Replace double quotes to one for simple types. E.g.:
       *
       * from: '{"field1":"{{ userId }}","field2":"some {{ userId }} body"}'
       * to: '{"field1":{{ userId }},"field2":"some {{ userId }} body"}'
       *
       * for keep original types
       */
      .replace(new RegExp(`(:)"({{ (${simpleTypeFieldNames.join('|')}) }})"`, 'g'), '$1$2');

    const templatedCondition = Templater.compile(stringCondition, templateVariables, {
      // Use custom template delimiters. E.g.: {{ userId }}
      interpolate: /{{([\s\S]+?)}}/g,
    });

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

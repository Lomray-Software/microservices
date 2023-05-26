import _ from 'lodash';
import type { Repository } from 'typeorm';
import FieldPolicy from '@constants/field-policy';
import type { FilterType } from '@constants/filter';
import type Condition from '@entities/condition';
import type Model from '@entities/model';
import type { IModelSchema, IRolePermissions } from '@entities/model';
import type ConditionChecker from '@services/condition-checker';
import type { IConditions } from '@services/condition-checker';
import Templater from '@services/templater';

export interface IFieldsFilter {
  userId?: string | null;
  userRoles: string[];
  conditionChecker: ConditionChecker;
  modelRepository: Repository<Model>;
  conditionRepository: Repository<Condition>;
  templateOptions?: Record<string, any>;
}

/**
 * Filter in/out request fields
 */
class FieldsFilter {
  /**
   * @private
   */
  private readonly userId: IFieldsFilter['userId'];

  /**
   * @private
   */
  private readonly userRoles: IFieldsFilter['userRoles'];

  /**
   * @private
   */
  private modelRepository: IFieldsFilter['modelRepository'];

  /**
   * @private
   */
  private conditionRepository: IFieldsFilter['conditionRepository'];

  /**
   * @private
   */
  private readonly conditionChecker: IFieldsFilter['conditionChecker'];

  /**
   * @private
   */
  private cachedSchemas: { [schemaAlias: string]: IModelSchema } = {
    denyAll: { '*': FieldPolicy.deny },
    allowAll: { '*': FieldPolicy.allow },
  };

  /**
   * @private
   */
  private cachedConditions: { [conditionTitle: string]: IConditions | undefined } = {};

  /**
   * @private
   */
  private templateOptions = { fields: {} };

  /**
   * @protected
   * @constructor
   */
  protected constructor({
    userId,
    userRoles,
    modelRepository,
    conditionRepository,
    conditionChecker,
    templateOptions,
  }: IFieldsFilter) {
    this.userId = userId;
    this.userRoles = userRoles;
    this.modelRepository = modelRepository;
    this.conditionRepository = conditionRepository;
    this.conditionChecker = conditionChecker;

    Object.assign(this.templateOptions, templateOptions);
  }

  /**
   * Init fields filter
   */
  public static init(params: IFieldsFilter): FieldsFilter {
    return new FieldsFilter(params);
  }

  /**
   * Filter fields by filter model
   */
  public async filter<TFields = Record<string, any>>(
    type: FilterType,
    model?: Model,
    fields?: TFields,
  ): Promise<Partial<TFields> | undefined> {
    const { alias, schema } = model ?? { alias: 'denyAll', schema: this.cachedSchemas.denyAll };

    this.cacheSchema(alias, schema);

    // filter only object or array of objects
    if (typeof fields !== 'object' || fields === null) {
      return fields;
    }

    if (fields) {
      this.templateOptions.fields = fields;
    }

    return (await this.filterBySchema(schema, type, alias, fields)) || {};
  }

  /**
   * Filter fields by schema
   */
  private async filterBySchema<TFields = Record<string, any>>(
    schema: IModelSchema,
    type: FilterType,
    schemaAlias: string,
    fields?: TFields,
  ): Promise<Partial<TFields> | undefined> {
    // general check for model
    if (schema['*'] === FieldPolicy.allow) {
      return fields;
    } else if (schema['*'] === FieldPolicy.deny) {
      return undefined;
    }

    if (Array.isArray(fields)) {
      return this.filterArray(schema, type, schemaAlias, fields);
    }

    const fieldsEntries = Object.entries(fields || {});

    // empty fields
    if (fieldsEntries.length === 0) {
      return fields;
    }

    const result = {};

    for (const [field, value] of fieldsEntries) {
      const policy = schema[field];
      let newValue;

      // field not described in schema or field is empty
      if (!policy || value === undefined) {
        continue;
      }

      // nested schema by alias
      if (typeof policy === 'string') {
        const nestedSchema = await this.getSchemaByAlias(policy);

        newValue = await this.filterBySchema(nestedSchema, type, policy, value);
      } else if ('case' in policy) {
        // dynamic schema (like switch - case)
        const caseValue = await this.checkField(
          policy.case[type] as IRolePermissions,
          type,
          field,
          schemaAlias,
          '*',
          fields,
        );

        // field is fully allowed
        if (caseValue === '*') {
          newValue = value;
        } else {
          const dynamicSchema = { [field]: policy.object[caseValue] } as IModelSchema;

          newValue = (
            await this.filterBySchema(dynamicSchema, type, schemaAlias, { [field]: value })
          )?.[field];

          if (_.isEmpty(newValue)) {
            newValue = undefined;
          }
        }
      } else if ('object' in policy) {
        // nested schema
        let nestedValue = value;

        // check object permissions
        if (type in policy) {
          nestedValue = await this.checkField(
            policy[type] as IRolePermissions,
            type,
            field,
            schemaAlias,
            value,
            fields,
          );

          if (!nestedValue) {
            continue;
          }
        }

        if (typeof policy.object === 'string') {
          // alias to nested schema
          newValue = (
            await this.filterBySchema(
              {
                [field]: policy.object,
              } as IModelSchema,
              type,
              schemaAlias,
              { [field]: nestedValue },
            )
          )?.[field];
        } else {
          // plain object
          newValue = await this.filterBySchema(policy.object, type, schemaAlias, nestedValue);
        }
      } else if (type in policy) {
        // simple field
        newValue = await this.checkField(
          policy[type] as IRolePermissions,
          type,
          field,
          schemaAlias,
          value,
          fields,
        );
      }

      if (newValue !== undefined) {
        result[field] = newValue;
      }
    }

    return result;
  }

  /**
   * Validate field by role permissions
   */
  private async checkField(
    permissions: IRolePermissions,
    type: FilterType,
    fieldName: string,
    schemaAlias: string,
    value: any,
    fields?: Record<string, any>,
  ): Promise<any> {
    for (const role of [...(this.userId ? [this.userId] : []), ...this.userRoles]) {
      const permission = permissions[role];

      if (!permissions[role]) {
        continue;
      }

      if (permission === FieldPolicy.allow) {
        return value;
      }

      if (permission === FieldPolicy.deny) {
        return undefined;
      }

      if ('condition' in permission) {
        this.conditionChecker.addTemplateParams(
          this.getTemplateParams(type, fieldName, schemaAlias, value, fields),
        );

        const condition = await this.getCondition(permission.condition);
        const isAllow = await this.conditionChecker.execConditions(condition);

        return isAllow ? value : undefined;
      }

      if ('template' in permission) {
        const newValue = this.templateValue(
          permission.template,
          type,
          fieldName,
          schemaAlias,
          value,
          fields,
        );

        if (newValue === 'undefined') {
          return undefined;
        }

        // keep initial value type
        return newValue === String(value) ? value : newValue;
      }

      return undefined;
    }
  }

  /**
   * Get condition
   */
  private async getCondition(title: string): Promise<IConditions | undefined> {
    if (!this.cachedConditions[title]) {
      this.cachedConditions[title] = (
        await this.conditionRepository.findOne({ title })
      )?.conditions;
    }

    return this.cachedConditions[title];
  }

  /**
   * Get template params
   */
  private getTemplateParams(
    type: FilterType,
    field: string,
    schemaAlias?: string,
    value?: any,
    fields: Record<string, any> = {},
  ): Record<string, any> {
    return {
      field,
      value,
      schemaAlias,
      entity: fields,
      params: this.templateOptions,
      current: {
        type,
        userId: this.userId,
        roles: this.userRoles,
      },
    };
  }

  /**
   * Template value
   */
  private templateValue(
    template: string,
    type: FilterType,
    field: string,
    schemaAlias: string,
    value?: any,
    fields: Record<string, any> = {},
  ): string {
    return Templater.compile(
      template,
      this.getTemplateParams(type, field, schemaAlias, value, fields),
    );
  }

  /**
   * Filter fields in array
   */
  private async filterArray<TFields extends Record<string, any>[]>(
    schema: IModelSchema,
    type: FilterType,
    schemaAlias: string,
    fields: TFields,
  ): Promise<TFields> {
    const result = [];

    for (const entity of fields) {
      result.push(await this.filterBySchema(schema, type, schemaAlias, entity));
    }

    return result as TFields;
  }

  /**
   * Get schema by alias
   */
  private async getSchemaByAlias(alias: string): Promise<IModelSchema> {
    if (this.cachedSchemas[alias]) {
      return this.cachedSchemas[alias];
    }

    const model = await this.modelRepository.findOne({ alias });

    // by default - deny schema
    const schema = model?.schema ?? this.cachedSchemas.denyAll;

    this.cacheSchema(alias, schema);

    return schema;
  }

  /**
   * Cache schema by alias
   */
  private cacheSchema(alias: string, schema: IModelSchema): void {
    if (this.cachedSchemas[alias]) {
      return;
    }

    this.cachedSchemas[alias] = schema;
  }
}

export default FieldsFilter;

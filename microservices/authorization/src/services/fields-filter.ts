import _ from 'lodash';
import type { Repository } from 'typeorm';
import FieldPolicy from '@constants/field-policy';
import { FilterType } from '@constants/filter';
import Model, { IModelSchema, IRolePermissions } from '@entities/model';

export interface IFieldsFilter {
  userId?: string;
  userRoles: string[];
  modelRepository: Repository<Model>;
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
  private cachedSchemas: { [schemaAlias: string]: IModelSchema } = {
    denyAll: { '*': FieldPolicy.deny },
    allowAll: { '*': FieldPolicy.allow },
  };

  /**
   * @private
   */
  private templateOptions = {};

  /**
   * @protected
   * @constructor
   */
  protected constructor({ userId, userRoles, modelRepository }: IFieldsFilter) {
    this.userId = userId;
    this.userRoles = userRoles;
    this.modelRepository = modelRepository;
  }

  /**
   * Init fields filter
   */
  static init(params: IFieldsFilter): FieldsFilter {
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

    if (fields) {
      this.templateOptions = fields;
    }

    // filter only object or array of objects
    if (typeof fields !== 'object' || fields === null) {
      return fields;
    }

    return (await this.filterBySchema(schema, type, fields)) || {};
  }

  /**
   * Filter fields by schema
   * @private
   */
  private async filterBySchema<TFields = Record<string, any>>(
    schema: IModelSchema,
    type: FilterType,
    fields?: TFields,
  ): Promise<Partial<TFields> | undefined> {
    // general check for model
    if (schema['*'] === FieldPolicy.allow) {
      return fields;
    } else if (schema['*'] === FieldPolicy.deny) {
      return undefined;
    }

    if (Array.isArray(fields)) {
      return this.filterArray(schema, type, fields);
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

        newValue = await this.filterBySchema(nestedSchema, type, value);
      } else if ('object' in policy) {
        // nested schema
        newValue = await this.filterBySchema(policy.object, type, value);
      } else if (type in policy) {
        // simple field
        newValue = this.checkField(policy[type] as IRolePermissions, value);
      }

      if (newValue !== undefined) {
        result[field] = newValue;
      }
    }

    return result;
  }

  /**
   * Validate field by role permissions
   * @private
   */
  private checkField(permissions: IRolePermissions, value: any): any {
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

      if (permission.template) {
        const newValue = _.template(permission.template)({
          value,
          fields: this.templateOptions,
          current: {
            userId: this.userId,
            roles: this.userRoles,
          },
        });

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
   * Filter fields in array
   * @private
   */
  private async filterArray<TFields extends Record<string, any>[]>(
    schema: IModelSchema,
    type: FilterType,
    fields: TFields,
  ): Promise<TFields> {
    const result = [];

    for (const entity of fields) {
      result.push(await this.filterBySchema(schema, type, entity));
    }

    return result as TFields;
  }

  /**
   * Get schema by alias
   * @private
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
   * @private
   */
  private cacheSchema(alias: string, schema: IModelSchema): void {
    if (this.cachedSchemas[alias]) {
      return;
    }

    this.cachedSchemas[alias] = schema;
  }
}

export default FieldsFilter;

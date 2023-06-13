import ucfirst from '@lomray/client-helpers/helpers/ucfirst';
import { IMicroserviceMeta, MicroserviceMeta } from '@lomray/microservice-helpers';
import type { AbstractMicroservice } from '@lomray/microservice-nodejs-lib';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import _ from 'lodash';
import type { SchemaObject } from 'openapi3-ts';
import CONST from '@constants/index';
import InputType from '@constants/input-type';
import schemaObjectTypes from '@constants/schema-object-types';
import ComponentEntity from '@entities/component';
import { ISingleTypeValue } from '@entities/single-type';
import lsfirst from '@helpers/lsfirst';
import type { IComponentSchema, IRelationSchema } from '@interfaces/component';
import TSchemaObjectType from '@interfaces/schema-object-type';
import ComponentRepository from '@repositories/component';
import SingleTypeRepository from '@repositories/single-type';

interface IBuildMetaSchemaParams {
  components: ComponentEntity[];
  // Required for components renaming
  value?: ISingleTypeValue;
  singleTypeAlias?: string;
  isNested?: boolean;
  // Ref by id on the parent component
  parentId?: string;
}

export interface ISingleTypeSchemaParams {
  componentRepository: ComponentRepository;
  singleTypeRepository: SingleTypeRepository;
}

/**
 * Single-type schema service
 */
class SingleTypeMeta {
  /**
   * @protected
   */
  protected readonly componentRepository: ISingleTypeSchemaParams['componentRepository'];

  /**
   * @protected
   */
  protected readonly singleTypeRepository: ISingleTypeSchemaParams['singleTypeRepository'];

  /**
   * @constructor
   */
  protected constructor({ componentRepository, singleTypeRepository }: ISingleTypeSchemaParams) {
    this.componentRepository = componentRepository;
    this.singleTypeRepository = singleTypeRepository;
  }

  /**
   * Init service
   */
  static init(params: ISingleTypeSchemaParams): SingleTypeMeta {
    return new SingleTypeMeta(params);
  }

  /**
   * Returns reference on entity in microservice
   */
  private makeRef(microservice: string, entity: string): string {
    return `#/definitions/${microservice}.${ucfirst(entity)}`;
  }

  /**
   * Returns schema type from according input type
   */
  private getSchemaType(type: InputType): TSchemaObjectType | null {
    return schemaObjectTypes?.hasOwnProperty(type) ? schemaObjectTypes[type] : null;
  }

  /**
   * Returns meta schema
   */
  private async buildMetaSchema({
    components,
    isNested = false,
    singleTypeAlias = 'UnknownAlias',
    value,
    parentId,
  }: IBuildMetaSchemaParams): Promise<SchemaObject> {
    const result: SchemaObject = {};

    for (const component of components) {
      const { alias: componentAlias, schema } = component;

      const prefix = isNested ? '' : 'DynamicModel';
      const aliasKey = `${prefix}${ucfirst(singleTypeAlias)}`;

      /**
       * Collect meta
       */
      const metaSchema = this.buildMeta(componentAlias);

      for (const input of schema) {
        const { type, name: inputName } = input;

        if (type === InputType.RELATION) {
          const {
            relation: { microservice, entity },
          } = input as IRelationSchema;

          metaSchema.properties[componentAlias].properties.data.properties[inputName] = {
            $ref: this.makeRef(microservice, entity),
          };
          continue;
        }

        if (type === InputType.COMPONENT) {
          /**
           * Extract ref from component
           */
          const { id: inputId } = input as IComponentSchema;

          const childrenComponents = await this.componentRepository.getChildrenComponentById(
            inputId,
          );

          if (!childrenComponents?.length) {
            continue;
          }

          const componentNames: { currentAlias: string; singleTypeKey?: string } = {
            currentAlias: componentAlias,
          };

          /**
           * Find custom component name in single type schema
           * @TODO: Investigate rename
           */
          if (value && !value?.[inputName]) {
            Object.entries(value).forEach(([key, componentSchema]: [string, IComponentSchema]) => {
              if (componentSchema.id !== parentId) {
                return;
              }

              componentNames.singleTypeKey = key;
            });
          }

          const nestedSchema = await this.buildMetaSchema({
            components: childrenComponents,
            value: value?.[componentAlias]?.data,
            singleTypeAlias: componentAlias,
            parentId: inputId,
            isNested: true,
          });

          metaSchema.properties[componentAlias].properties.data.properties = {
            // Primitive data   inputs (stored in the component relations with the native name)
            ...metaSchema.properties[componentAlias].properties.data.properties,
            // Reference (components) data inputs
            ...nestedSchema?.properties,
          };
          continue;
        }

        /**
         * If is primitive
         */
        metaSchema.properties[componentAlias].properties.data.properties[inputName] = {
          type: this.getSchemaType(type),
        };
      }

      _.merge(result, isNested ? metaSchema : { [aliasKey]: metaSchema });
    }

    return result;
  }

  /**
   * Returns merged into single object relations
   */
  private toObjectSchema(relations: SchemaObject[]): Record<string, SchemaObject> {
    return relations.reduce((entity, relation) => ({ ...entity, ...relation }), {}) as Record<
      string,
      SchemaObject
    >;
  }

  /**
   * Returns reference schema
   */
  private buildRefSchema(schema: SchemaObject): SchemaObject {
    const refSchema = {
      type: 'object',
      properties: {},
    };

    Object.entries(schema).forEach(([alias]) => {
      const originalAlias = lsfirst(alias.replace('DynamicModel', ''));

      refSchema.properties[originalAlias] = { $ref: `#/definitions/${alias}` };
    });

    return refSchema as SchemaObject;
  }

  /**
   * Returns created single-type schemas
   */
  private async getSchemas(): Promise<{
    schema: Record<string, SchemaObject>;
    refSchema: SchemaObject;
  }> {
    const singleTypes = await this.singleTypeRepository.find();

    /**
     * Get single-types with relations
     */
    const singleTypesWithRelationsRequests = singleTypes.map(async ({ id, ...rest }) => ({
      ...rest,
      id,
      components: await this.componentRepository.getRelatedComponentBySingleTypeId(id),
    }));

    const singleTypesWithRelations = await Promise.all(singleTypesWithRelationsRequests);

    /**
     * Get schemas
     */
    const schemasRequests = singleTypesWithRelations.map(({ components, alias, value }) =>
      this.buildMetaSchema({
        components,
        singleTypeAlias: alias,
        value,
      }),
    );

    /**
     * Returns parsed and constructed schemas
     */
    const schema = this.toObjectSchema(await Promise.all(schemasRequests));
    const refSchema = this.buildRefSchema(schema);

    return { schema, refSchema };
  }

  /**
   * Returns microservice meta
   */
  public async endpointHandler(app: AbstractMicroservice): Promise<IMicroserviceMeta> {
    const defaultMetaEndpoint = MicroserviceMeta.getMeta(app.getEndpoints(), CONST.VERSION);

    if (!defaultMetaEndpoint) {
      throw new BaseException({
        status: 500,
        message: 'Failed to get MetaEndpoint data',
      });
    }

    const { schema, refSchema } = await this.getSchemas();

    defaultMetaEndpoint.entities = {
      ...defaultMetaEndpoint.entities,
      ...schema,
    };

    if (!defaultMetaEndpoint.entities.SingleType.properties?.hasOwnProperty('value')) {
      return defaultMetaEndpoint;
    }

    defaultMetaEndpoint.entities.SingleType.properties.value = refSchema;

    return defaultMetaEndpoint;
  }

  /**
   * Returns new properties with the provided alias
   */
  private buildMeta(alias: string) {
    return {
      type: 'object',
      properties: {
        [alias]: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: { type: 'object', properties: {} },
          },
        },
      },
    };
  }
}

export default SingleTypeMeta;

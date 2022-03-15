import { IMicroserviceMeta, Log } from '@lomray/microservice-helpers';
import { AbstractMicroservice } from '@lomray/microservice-nodejs-lib';
import _ from 'lodash';
import { EntityManager, Repository } from 'typeorm';
import FieldPolicy from '@constants/field-policy';
import Method from '@entities/method';
import Model, { IModelSchema } from '@entities/model';

export interface IMethodsImporterParams {
  metaEndpoint?: string | { [msName: string]: string };
  defaultAllowGroup?: string[];
  defaultSchemaRoles?: string[];
  commonModelAliases?: string[];
}

export interface IMethodsImporterResult {
  [msName: string]: {
    isSuccess?: boolean;
    error?: string;
  };
}

/**
 * This service get metadata from connected microservices and import:
 *  - methods
 *  - models (entities)
 */
class MethodsImporter {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly ms: AbstractMicroservice;

  /**
   * @private
   */
  private readonly params: IMethodsImporterParams;

  /**
   * Save handled (save/update) models for microservice (reset it for each microservice)
   * @private
   */
  private handledModels = new Set();

  /**
   * @constructor
   * @private
   */
  private constructor(
    ms: AbstractMicroservice,
    manager: EntityManager,
    params?: IMethodsImporterParams,
  ) {
    this.ms = ms;
    this.manager = manager;
    this.params = params ?? {};
  }

  /**
   * Create service
   */
  public static create(
    ms: AbstractMicroservice,
    manager: EntityManager,
    params?: IMethodsImporterParams,
  ): MethodsImporter {
    return new MethodsImporter(ms, manager, params);
  }

  /**
   * Import methods & models
   */
  public async import(): Promise<IMethodsImporterResult> {
    const availableMs = await this.ms.lookup(true);
    const result = {};

    for (const msName of availableMs) {
      try {
        const msMetaResponse = await this.ms.sendRequest<never, IMicroserviceMeta>(
          this.getMetaEndpoint(msName),
        );

        if (msMetaResponse.getError()) {
          result[msName] = {
            error: `Failed to import microservice metadata: ${
              msMetaResponse.getError()?.message ?? ''
            }`,
          };
          Log.error(result[msName].error, msMetaResponse.getError());
          continue;
        }

        const { endpoints, entities } = msMetaResponse.getResult() ?? {};

        if (!endpoints) {
          result[msName] = { error: `Microservice endpoints not found: ${msName}` };
          Log.error(result[msName].error);
          continue;
        }

        await this.loadMethods(msName, endpoints, entities);

        result[msName] = { isSuccess: true };
      } catch (e) {
        result[msName] = { error: "Microservice meta endpoint doesn't exist." };
        Log.error(result[msName].error);
      }
    }

    return result;
  }

  /**
   * Get microservice metadata endpoint
   * @private
   */
  private getMetaEndpoint(msName: string): string {
    const { metaEndpoint = 'meta' } = this.params;

    return [msName, metaEndpoint?.[msName] ?? metaEndpoint].join('.');
  }

  /**
   * Import microservice methods
   * @private
   */
  private loadMethods(
    microservice: string,
    endpoints: IMicroserviceMeta['endpoints'],
    entities: IMicroserviceMeta['entities'] = {},
  ): Promise<void> {
    const { defaultAllowGroup } = this.params;

    return this.manager.transaction(async (transactionManager) => {
      const methodRepository = transactionManager.getRepository(Method);
      const modelRepository = transactionManager.getRepository(Model);

      for (const [methodName, { input, output, description }] of Object.entries(endpoints)) {
        const [modelIn, modelOut] = await Promise.all([
          // create or update input model if exist
          (input[0] &&
            this.updateOrCreateModel(modelRepository, {
              microservice,
              schemaEntities: entities,
              schemaName: input[0],
              schemaParams: input[1],
            })) ||
            undefined,
          // create or update output model if exist
          (output[0] &&
            (await this.updateOrCreateModel(modelRepository, {
              microservice,
              schemaEntities: entities,
              schemaName: output[0],
              schemaParams: output[1],
            }))) ||
            undefined,
        ]);

        await MethodsImporter.updateOrCreateMethod(methodRepository, {
          microservice,
          method: methodName,
          description,
          allowGroup: defaultAllowGroup,
          modelInId: modelIn?.id,
          modelOutId: modelOut?.id,
        });
      }
    });
  }

  /**
   * Create or update method
   * @private
   */
  private static async updateOrCreateMethod(
    repository: Repository<Method>,
    fields: Partial<Method>,
  ): Promise<void> {
    const { microservice, method, description, modelInId, modelOutId, allowGroup } = fields;
    let methodEntity = await repository.findOne({ microservice, method });

    if (!methodEntity) {
      methodEntity = repository.create(fields);
    } else {
      methodEntity.description = description || methodEntity.description;
      methodEntity.modelInId = modelInId ?? null;
      methodEntity.modelOutId = modelOutId ?? null;
      methodEntity.allowGroup = [...new Set([...methodEntity.allowGroup, ...(allowGroup ?? [])])];
    }

    await repository.save(methodEntity);
  }

  /**
   * Create or update model
   * @private
   */
  private async updateOrCreateModel(
    repository: Repository<Model>,
    params: {
      microservice: string;
      schemaEntities: IMicroserviceMeta['entities'];
      schemaName: string;
      schemaParams?: Record<string, any>;
    },
  ): Promise<Model | undefined> {
    const { microservice, schemaEntities, schemaName, schemaParams } = params;
    const alias = this.getSchemaAlias(schemaName, microservice);

    const { commonModelAliases = [] } = this.params;
    const isCommonModel = Boolean(commonModelAliases.includes(schemaName));
    let model = await repository.findOne({
      ...(isCommonModel ? {} : { microservice }),
      alias,
    });

    // no need update model
    if (this.handledModels.has(alias)) {
      return model;
    }

    if (!model) {
      model = repository.create({
        ...(isCommonModel ? {} : { microservice }),
        alias,
        title: schemaName.match(/[A-Z][a-z]+/g)?.join(' ') ?? schemaName, // 'FromThis' => 'From This'
      });
    }

    const { schema, related } = this.buildSchema({
      microservice,
      entitySchema: schemaEntities[schemaName],
      schemaParams,
      baseSchema: model.schema ?? {},
    });

    model.schema = schema;

    // need also add related schemas
    if (related.length > 0) {
      // save memory (don't use Promise.all)
      for (const relatedSchemaName of related) {
        await this.updateOrCreateModel(repository, {
          microservice,
          schemaEntities,
          schemaName: relatedSchemaName,
        });
      }
    }

    this.handledModels.add(model.alias);

    return repository.save(model);
  }

  /**
   * Build/rebuild model schema
   * @private
   */
  private buildSchema({
    microservice,
    baseSchema,
    entitySchema,
    schemaParams,
  }: {
    microservice: string;
    baseSchema?: IModelSchema;
    entitySchema?: IMicroserviceMeta['entities'][string];
    schemaParams?: Record<string, any>;
  }): { schema: IModelSchema; related: string[] } {
    if (!entitySchema) {
      return { schema: {} as IModelSchema, related: [] };
    }

    const { defaultSchemaRoles = [] } = this.params;
    const related = new Set<string>();
    const schema = Object.entries(entitySchema.properties ?? {}).reduce(
      (res, [fieldName, fieldSchema]) => {
        // just keep previous field definition
        if (baseSchema?.[fieldName]) {
          res[fieldName] = baseSchema[fieldName];
        } else if (schemaParams?.[fieldName]) {
          const alias = Array.isArray(schemaParams[fieldName])
            ? schemaParams[fieldName][0]
            : schemaParams[fieldName];

          // this field should be related to another schema (start model)
          res[fieldName] = this.getSchemaAlias(alias, microservice);

          related.add(alias);
        } else if (fieldSchema.$ref && !fieldSchema.$ref.endsWith('/Object')) {
          // this field should be related to another schema (nested model)
          const [alias, uniqueAlias] = this.getRefSchemaAlias(fieldSchema.$ref, microservice);

          res[fieldName] = uniqueAlias;

          related.add(alias);
        } else if ('properties' in fieldSchema) {
          // nested object
          const { schema: nestedSchema, related: childrenSchemas } = this.buildSchema({
            microservice,
            entitySchema: fieldSchema,
          });

          res[fieldName] = { object: nestedSchema };
          childrenSchemas.forEach((childrenSchema) => related.add(childrenSchema));
        } else {
          // new schema field - set default permission
          res[fieldName] = { in: {}, out: {} };

          defaultSchemaRoles.forEach((role) => {
            res[fieldName].in[role] = FieldPolicy.allow;
            res[fieldName].out[role] = FieldPolicy.allow;
          });
        }

        return res;
      },
      _.pick(baseSchema ?? ({} as IModelSchema), ['*']),
    );

    return { schema, related: [...related] };
  }

  /**
   * Get schema alias name by field reference
   * @private
   */
  private getRefSchemaAlias(name: string, microservice: string): string[] {
    const refParts = name.split('/');
    const schemaAlias = refParts[refParts.length - 1];

    return [schemaAlias, this.getSchemaAlias(schemaAlias, microservice)];
  }

  /**
   * Get schema alias name
   * @private
   */
  private getSchemaAlias(name: string, microservice: string): string {
    const isCommonModel = Boolean(this.params.commonModelAliases?.includes(name));

    if (isCommonModel) {
      return name;
    }

    return [microservice, name].join('.');
  }
}

export default MethodsImporter;

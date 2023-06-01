import * as crypto from 'crypto';
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
  public async import(onlyMs: string[] = []): Promise<IMethodsImporterResult> {
    const availableMs = (await this.ms.lookup(true)).filter(
      (ms) => !onlyMs.length || onlyMs.includes(ms),
    );
    const result: IMethodsImporterResult = {};

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
          Log.error(result[msName].error as string, msMetaResponse.getError());
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
        Log.error(result[msName].error as string, e);
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
        // create or update input model
        const modelIn =
          (await (input[0] &&
            this.updateOrCreateModel(modelRepository, {
              microservice,
              schemaEntities: entities,
              schemaName: input[0],
              schemaParams: input[1],
            }))) || undefined;
        // create or update output model
        const modelOut =
          (output[0] &&
            (await this.updateOrCreateModel(modelRepository, {
              microservice,
              schemaEntities: entities,
              schemaName: output[0],
              schemaParams: output[1],
            }))) ||
          undefined;

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
      methodEntity.allowGroup = [...new Set(methodEntity.allowGroup ?? allowGroup ?? [])];
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
      schemaParams?: Record<string, any> | null;
    },
  ): Promise<Model | undefined> {
    const { microservice, schemaEntities, schemaName, schemaParams } = params;
    const alias = this.getSchemaAlias(schemaName, microservice, schemaParams);

    const { commonModelAliases = [] } = this.params;
    const isCommonModel = Boolean(commonModelAliases.includes(schemaName));
    let model = await repository.findOne({
      ...(isCommonModel ? {} : { microservice }),
      alias,
    });

    // no need create/update model
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

    this.handledModels.add(model.alias);

    // need also add related schemas
    if (related.length > 0) {
      for (const relatedSchemaName of related) {
        // skip self referencing
        if (this.getSchemaAlias(relatedSchemaName, microservice) === alias) {
          continue;
        }

        // skip another microservice referencing
        if (relatedSchemaName.includes('.')) {
          continue;
        }

        await this.updateOrCreateModel(repository, {
          microservice,
          schemaEntities,
          schemaName: relatedSchemaName,
        });
      }
    }

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
    schemaParams?: Record<string, any> | null;
  }): { schema: IModelSchema; related: string[] } {
    if (!entitySchema) {
      return { schema: {} as IModelSchema, related: [] };
    }

    const { defaultSchemaRoles = [] } = this.params;
    const related = new Set<string>();
    const schema = Object.entries(entitySchema.properties ?? {}).reduce(
      (res, [fieldName, fieldSchema]) => {
        if (schemaParams?.[fieldName]) {
          const alias: string = Array.isArray(schemaParams[fieldName])
            ? schemaParams[fieldName][0]
            : schemaParams[fieldName];

          // this field should be related to another schema (start model)
          res[fieldName] = this.getSchemaAlias(alias, microservice);

          related.add(alias);
        } else if (
          '$ref' in fieldSchema &&
          !fieldSchema.$ref.endsWith('/Object') &&
          !fieldSchema.$ref.endsWith('/Array') &&
          !fieldSchema.$ref.endsWith('/Date') &&
          !fieldSchema.$ref.endsWith('/Function')
        ) {
          // this field should be related to another schema (nested model)
          const [alias, uniqueAlias] = this.getRefSchemaAlias(
            fieldSchema.$ref as string,
            microservice,
          );

          res[fieldName] = uniqueAlias;

          related.add(alias);
        } else if ('properties' in fieldSchema) {
          // nested object
          const { schema: nestedSchema, related: childrenSchemas } = this.buildSchema({
            microservice,
            entitySchema: fieldSchema,
          });

          res[fieldName] = { object: nestedSchema };

          // keep case template from previous schema
          if (baseSchema?.[fieldName]?.['case']) {
            res[fieldName]['case'] = baseSchema[fieldName]['case'];
          }

          childrenSchemas.forEach((childrenSchema) => related.add(childrenSchema));
        } else {
          // new schema field - set default permission, or copy prev permissions
          res[fieldName] = baseSchema?.[fieldName] ?? { in: {}, out: {} };

          if (!baseSchema?.[fieldName]) {
            defaultSchemaRoles.forEach((role) => {
              _.set(res, `${fieldName}.in.${role}`, FieldPolicy.allow);
              _.set(res, `${fieldName}.out.${role}`, FieldPolicy.allow);
            });
          }
        }

        return res;
      },
      // keep '*' from existing schema
      _.pick(baseSchema ?? ({} as IModelSchema), ['*']),
    );
    // keep custom fields
    const customFields = Object.entries(baseSchema ?? {}).reduce(
      (res, [field, permissions]) => ({
        ...res,
        ...(permissions?.['isCustom'] === true
          ? {
              [field]: permissions,
            }
          : {}),
      }),
      {} as IModelSchema,
    );

    return { schema: { ...schema, ...customFields }, related: [...related] };
  }

  /**
   * Get schema alias name by field reference
   * @private
   */
  private getRefSchemaAlias(name: string, microservice: string): string[] {
    const refParts = name.split('/');
    const schemaAlias = refParts[refParts.length - 1];

    // direct alias to another microservice
    if (schemaAlias.includes('.')) {
      return [schemaAlias, schemaAlias];
    }

    return [schemaAlias, this.getSchemaAlias(schemaAlias, microservice)];
  }

  /**
   * Get schema alias name
   * @private
   */
  private getSchemaAlias(
    name: string,
    microservice: string,
    schemaParams?: Record<string, any> | null,
  ): string {
    const isCommonModel = Boolean(this.params.commonModelAliases?.includes(name));

    if (isCommonModel) {
      return name;
    }

    const hash = _.isEmpty(schemaParams)
      ? null
      : crypto.createHash('md5').update(JSON.stringify(schemaParams)).digest('hex');

    return [microservice, name, hash].filter(Boolean).join('.');
  }
}

export default MethodsImporter;

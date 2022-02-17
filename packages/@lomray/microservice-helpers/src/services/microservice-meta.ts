import type { IEndpointHandlerOptions, IEndpoints } from '@lomray/microservice-nodejs-lib';
import { IsObject } from 'class-validator';
import { JSONSchema, validationMetadatasToSchemas } from 'class-validator-jsonschema';
import type { SchemaObject } from 'openapi3-ts';
import type { IWithEndpointMeta } from '@services/endpoint';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

interface IMicroserviceMeta {
  endpoints: {
    [path: string]: {
      options: IEndpointHandlerOptions;
      input: ReturnType<IWithEndpointMeta['getMeta']>['input'];
      output: ReturnType<IWithEndpointMeta['getMeta']>['output'];
      description?: string;
    };
  };
  entities: Record<string, SchemaObject>;
}

/**
 * Microservice meta output params
 */
class MicroserviceMetaOutput {
  @JSONSchema({
    description:
      'Microservice endpoints metadata (endpoint, options, input, output params). Any ClassName you can find in "entities".',
    example: {
      'demo-ms.test-endpoint': {
        options: { isPrivate: true, isDisableMiddlewares: false },
        input: ['ClassNameOfInputParams', { someProperty: 'ClassName' }],
        output: ['ClassNameOfOutputParams', { someProperty: 'ClassNameOutput' }],
      },
    },
  })
  @IsObject()
  endpoints: IMicroserviceMeta['endpoints'];

  @JSONSchema({
    description: "Microservice entities metadata. SchemaObject - it's OpenApi schema object.",
    example: {
      DemoEntity: 'SchemaObject',
    },
  })
  @IsObject()
  entities: IMicroserviceMeta['entities'];
}

/**
 * Build metadata for microservice
 */
class MicroserviceMeta {
  /**
   * Get all entities schema
   * @private
   */
  public static getEntitiesMeta(): Record<string, SchemaObject> {
    return validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
    });
  }

  /**
   * Make and return endpoints metadata
   */
  public static getMeta(msEndpoints: IEndpoints): IMicroserviceMeta {
    const entities = MicroserviceMeta.getEntitiesMeta();
    const endpoints = Object.entries(msEndpoints).reduce((res, [path, { handler, options }]) => {
      const { input, output, description } =
        (handler as unknown as IWithEndpointMeta).getMeta?.() ?? {};

      return {
        ...res,
        [path]: {
          options,
          input,
          output,
          description,
        },
      };
    }, {});

    return { endpoints, entities };
  }
}

export { MicroserviceMeta, MicroserviceMetaOutput };

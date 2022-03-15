import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsArray, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import MethodsImporter, { IMethodsImporterResult } from '@services/methods-importer';

class SyncMetadataInput {
  @JSONSchema({
    description: 'Default roles for model attributes',
  })
  @IsArray()
  @IsUndefinable()
  defaultSchemaRoles?: string[];

  @JSONSchema({
    description: 'Default roles for methods',
  })
  @IsArray()
  @IsUndefinable()
  defaultAllowGroup?: string[];

  @IsArray()
  @IsUndefinable()
  commonModelAliases?: string[];
}

class SyncMetadataOutput {
  @JSONSchema({
    example: {
      msName1: { isSuccess: true },
      msName2: { error: 'Error message' },
      msName3: { isSuccess: true },
    },
  })
  @IsObject()
  microservices: IMethodsImporterResult;
}

/**
 * Import methods & models from microservices
 */
const syncMetadata = Endpoint.custom(
  () => ({
    input: SyncMetadataInput,
    output: SyncMetadataOutput,
    description:
      'Import microservices methods and entities (create/update info about methods & models).',
  }),
  async ({ commonModelAliases, defaultAllowGroup, defaultSchemaRoles }, { app }) => {
    const service = MethodsImporter.create(app, getManager(), {
      commonModelAliases,
      defaultAllowGroup,
      defaultSchemaRoles,
    });
    const microservices = await service.import();

    return { microservices };
  },
);

export default syncMetadata;

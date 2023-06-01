import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsArray, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import COMMON_MODELS from '@constants/common-models';
import MethodsImporter, { IMethodsImporterResult } from '@services/methods-importer';

class SyncMetadataInput {
  @JSONSchema({
    description: 'Default roles for model attributes. By default: admin',
  })
  @IsArray()
  @IsUndefinable()
  defaultSchemaRoles?: string[];

  @JSONSchema({
    description: 'Default roles for methods. By default: admin.',
  })
  @IsArray()
  @IsUndefinable()
  defaultAllowGroup?: string[];

  @JSONSchema({
    description: 'Common model aliases for all microservices.',
  })
  @IsArray()
  @IsUndefinable()
  commonModelAliases?: string[];

  @JSONSchema({
    description: 'Sync metadata only for provided microservices.',
  })
  @IsArray()
  @IsUndefinable()
  onlyMs?: string[];
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
  async (
    {
      commonModelAliases = [],
      defaultAllowGroup = ['admin'],
      defaultSchemaRoles = ['admin'],
      onlyMs = [],
    },
    { app },
  ) => {
    const service = MethodsImporter.create(app, getManager(), {
      commonModelAliases: [...COMMON_MODELS, ...commonModelAliases],
      defaultAllowGroup,
      defaultSchemaRoles,
    });
    const microservices = await service.import(onlyMs);

    return { microservices };
  },
);

export default syncMetadata;

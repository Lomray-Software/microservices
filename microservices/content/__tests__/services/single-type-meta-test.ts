import * as console from 'console';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import type { SchemaObject } from 'openapi3-ts';
import sinon from 'sinon';
import { getRepository } from 'typeorm';
import { schemaObjectMock, schemaObjectsMock } from '@__mocks__/single-type-meta';
import InputType from '@constants/input-type';
import ComponentEntity from '@entities/component';
import ComponentRepository from '@repositories/component';
import SingleTypeRepository from '@repositories/single-type';
import type { ISingleTypeSchemaParams } from '@services/single-type-meta';
import SingleTypeMeta from '@services/single-type-meta';

describe('services/single-type-meta', () => {
  const sandbox = sinon.createSandbox();

  let mockParams: ISingleTypeSchemaParams;
  let singleTypeMeta: SingleTypeMeta;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
    mockParams = {
      componentRepository: {} as ComponentRepository,
      singleTypeRepository: {} as SingleTypeRepository,
    };
    singleTypeMeta = SingleTypeMeta.init(mockParams);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return a new instance of SingleTypeMeta', () => {
    const service = SingleTypeMeta.init(mockParams);

    expect(service).to.be.an.instanceOf(SingleTypeMeta);
  });

  it('should return the correct reference string', () => {
    const microservice = 'users';
    const entity = 'user';
    const expectedResult = '#/definitions/users.User';

    expect(singleTypeMeta['makeRef'](microservice, entity)).to.equal(expectedResult);
  });

  it('should return the corresponding schema type for a given input type', () => {
    const booleanType = singleTypeMeta['getSchemaType'](InputType.BOOLEAN);
    const textType = singleTypeMeta['getSchemaType'](InputType.TEXT);
    const richTextType = singleTypeMeta['getSchemaType'](InputType.RICH_TEXT);
    const emailType = singleTypeMeta['getSchemaType'](InputType.EMAIL);
    const passwordType = singleTypeMeta['getSchemaType'](InputType.EMAIL);
    const enumType = singleTypeMeta['getSchemaType'](InputType.ENUM);
    const jsonType = singleTypeMeta['getSchemaType'](InputType.JSON);
    // @ts-ignore
    const customComponentType = singleTypeMeta['getSchemaType']('customComponent');
    const componentType = singleTypeMeta['getSchemaType'](InputType.COMPONENT);
    const relationType = singleTypeMeta['getSchemaType'](InputType.RELATION);

    expect(booleanType).to.equal('boolean');
    expect(textType).to.equal('string');
    expect(richTextType).to.equal('string');
    expect(emailType).to.equal('string');
    expect(passwordType).to.equal('string');
    expect(enumType).to.equal('array');
    expect(jsonType).to.equal('object');
    expect(customComponentType).to.be.null;
    expect(componentType).to.be.null;
    expect(relationType).to.be.null;
  });

  it('should return valid schema object structure', () => {
    const metadata = singleTypeMeta['toObjectSchema'](schemaObjectsMock);

    expect(metadata).to.be.deep.equal(schemaObjectMock);
  });

  it('should return a reference schema object', () => {
    const schema = { schema1: { type: 'object' }, schema2: { type: 'number' } };
    const refSchema = singleTypeMeta['buildRefSchema'](schema);

    expect(refSchema).to.deep.equal({
      type: 'object',
      properties: {
        schema1: { $ref: '#/definitions/schema1' },
        schema2: { $ref: '#/definitions/schema2' },
      },
    });
  });

  it('should build the meta schema', async () => {
    const componentRepository = getRepository(ComponentEntity);
    const value = {};
    const components: ComponentEntity[] = [
      componentRepository.create({
        id: '1',
        alias: 'testAlias',
        schema: [
          { name: 'field1', title: 'Field 1', type: InputType.TEXT },
          { name: 'field2', title: 'Field 2', type: InputType.NUMBER },
        ],
      }),
    ];

    const result = await singleTypeMeta['buildMetaSchema']({
      components,
      value,
      isNested: false,
    });

    const expected: Record<string, SchemaObject> = {
      DynamicModelUnknownAlias: {
        type: 'object',
        properties: {
          testAlias: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  field1: { type: 'string' },
                  field2: { type: 'number' },
                },
              },
            },
          },
        },
      },
    };

    console.log('re', result);
    expect(result).to.deep.equal(expected);
  });

  it('should build the reference schema', () => {
    const schemaObject: Record<string, SchemaObject> = {
      DynamicModelGreenAlias: {
        type: 'object',
        properties: {
          greenAlias: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  field1: { type: 'string' },
                  field2: { type: 'number' },
                },
              },
            },
          },
        },
      },
    };

    const result = singleTypeMeta['buildRefSchema'](schemaObject);

    const expected: SchemaObject = {
      type: 'object',
      properties: {
        greenAlias: { $ref: '#/definitions/DynamicModelGreenAlias' },
      },
    };

    expect(result).to.deep.equal(expected);
  });
});

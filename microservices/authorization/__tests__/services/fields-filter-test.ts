import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import Model, { FieldPolicy } from '@entities/model';
import FieldsFilter, { FilterType } from '@services/fields-filter';

describe('services/fields-filter', () => {
  const userId = 'user-id-1';
  const userRoles = ['users', 'guests']; // order matters
  const modelRepository = TypeormMock.entityManager.getRepository(Model);
  const service = FieldsFilter.init({
    userId,
    userRoles,
    modelRepository,
  });
  const inputFields = { hello: 'world' };

  const allowAllModel = modelRepository.create({
    alias: 'allowAll',
    schema: { '*': FieldPolicy.allow },
  });
  const denyAllSchema = modelRepository.create({
    alias: 'denyAll',
    schema: { '*': FieldPolicy.deny },
  });
  const emptyAllSchema = modelRepository.create({
    alias: 'empty',
    schema: {},
  });

  afterEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should allow all fields', async () => {
    expect(await service.filter(FilterType.IN, allowAllModel, inputFields)).to.deep.equal(
      inputFields,
    );
  });

  it('should deny all fields', async () => {
    expect(await service.filter(FilterType.IN, denyAllSchema, inputFields)).to.deep.equal({});
  });

  it('should deny all fields: empty schema', async () => {
    expect(await service.filter(FilterType.IN, emptyAllSchema, inputFields)).to.deep.equal({});
  });

  it('should correctly handle empty fields', async () => {
    expect(await service.filter(FilterType.IN, emptyAllSchema, {})).to.deep.equal({});
    expect(await service.filter(FilterType.IN, emptyAllSchema, undefined)).to.deep.equal(undefined);
    expect(await service.filter(FilterType.IN, emptyAllSchema, null)).to.deep.equal(null);
  });

  it('should try lazy load schema by alias: allow schema', async () => {
    const input = { example: { field: 1 } };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        example: 'example',
      },
    });

    // resolve allow schema on first call (on second call return cached schema)
    TypeormMock.entityManager.findOne.onCall(0).resolves(allowAllModel);

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal(input);
    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal(input);
  });

  it('should try lazy load schema by alias: default schema (deny)', async () => {
    const input = { example: { field: 1 } };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        example: 'denyDefault',
      },
    });

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({});
  });

  it('should correctly filter field: standard permissions', async () => {
    const input = { test: 'hi' };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        test: {
          in: { guests: FieldPolicy.deny, users: FieldPolicy.allow, 5: FieldPolicy.deny },
          out: { guests: FieldPolicy.allow },
        },
      },
    });
    const cases = [
      { userId, userRoles, type: FilterType.IN, result: input },
      { userId: '5', userRoles, type: FilterType.IN, result: {} },
      { userId: '1', userRoles: ['guests'], type: FilterType.IN, result: {} },
      { userId: 'user-0', userRoles: ['guests'], type: FilterType.OUT, result: input },
    ] as const;

    for (const testCase of cases) {
      const srv = FieldsFilter.init({
        userId: testCase.userId,
        userRoles: testCase.userRoles as string[],
        modelRepository,
      });

      expect(await srv.filter(testCase.type, model, input)).to.deep.equal(testCase.result);
    }
  });

  it('should correctly filter field: nested object', async () => {
    const input = {
      nestedAllow: {
        nested1: 1,
        nested: false,
      },
      nestedPartial: {
        part1: 'hi',
        part2: 'world',
      },
    };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        nestedAllow: 'allowAll',
        nestedPartial: {
          object: {
            part1: {
              in: { guests: FieldPolicy.allow },
            },
            part2: {}, // skip = deny
          },
        },
      },
    });

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({
      nestedAllow: input.nestedAllow,
      nestedPartial: {
        part1: 'hi',
      },
    });
  });

  it('should correctly filter field: array', async () => {
    const input = {
      array: [
        { one: true, two: false },
        { one: false, two: true },
        { one: false, two: true, three: 'sample' },
      ],
    };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        array: {
          object: {
            one: {
              in: { guests: FieldPolicy.allow },
              out: { guests: FieldPolicy.allow },
            },
            two: {
              in: { guests: FieldPolicy.deny },
              out: { guests: FieldPolicy.allow },
            },
            three: {
              in: { users: FieldPolicy.allow },
              out: { users: FieldPolicy.allow },
            },
          },
        },
      },
    });

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({
      array: [{ one: true }, { one: false }, { one: false, three: 'sample' }],
    });
    expect(await service.filter(FilterType.OUT, model, input)).to.deep.equal(input);
  });

  it('should correctly filter field: deep alias', async () => {
    const input = {
      deepAlias: {
        related: { hello: 'world' },
        allowMe: { sample: 'field', hello: 5 },
      },
    };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        deepAlias: {
          object: {
            related: 'denyAll',
            allowMe: { object: { '*': FieldPolicy.allow } },
          },
        },
      },
    });

    expect(await service.filter(FilterType.OUT, model, input)).to.deep.equal({
      deepAlias: { allowMe: input.deepAlias.allowMe },
    });
  });

  it('should correctly filter field: field empty template', async () => {
    const input = { userId: 99 };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        userId: {
          in: { guests: FieldPolicy.deny, users: { template: '' } },
          out: { guests: FieldPolicy.allow },
        },
      },
    });

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({});
  });

  it('should correctly filter field: field empty template', async () => {
    const input = {
      userId: 'user-100',
    };
    const model = modelRepository.create({
      alias: 'inputTest',
      schema: {
        userId: {
          in: {
            guests: FieldPolicy.deny,
            users: {
              // allow only if userId equal userId from authentication microservice
              template: '<%= value === current.userId ? value : "undefined" %>',
            },
          },
          out: { guests: FieldPolicy.allow },
        },
      },
    });
    const srv = FieldsFilter.init({ userId: input.userId, userRoles, modelRepository });

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({});
    expect(await srv.filter(FilterType.IN, model, input)).to.deep.equal({ userId: input.userId });
    expect(await service.filter(FilterType.OUT, model, input)).to.deep.equal({
      userId: input.userId,
    });
  });
});

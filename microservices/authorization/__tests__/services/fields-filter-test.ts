import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import FieldPolicy from '@constants/field-policy';
import { FilterType } from '@constants/filter';
import Condition from '@entities/condition';
import Model from '@entities/model';
import ConditionChecker from '@services/condition-checker';
import FieldsFilter from '@services/fields-filter';

describe('services/fields-filter', () => {
  const sandbox = sinon.createSandbox();
  const userId = 'user-id-1';
  const userRoles = ['users', 'guests']; // order matters
  const modelRepository = TypeormMock.entityManager.getRepository(Model);
  const conditionRepository = TypeormMock.entityManager.getRepository(Condition);
  const conditionChecker = new ConditionChecker(Microservice.getInstance());
  const service = FieldsFilter.init({
    userId,
    userRoles,
    modelRepository,
    conditionRepository,
    conditionChecker,
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
    sandbox.restore();
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
        conditionRepository,
        conditionChecker,
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
      nestedModel: {
        hello: 'model',
      },
      nestedPerm1: {
        should: 'not-empty',
      },
      nestedPerm2: {
        should: 'empty',
      },
      nestedPerm3: [{ test: 1 }, { test: 2 }],
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
        nestedModel: {
          object: 'nestedModel',
        },
        nestedPerm1: {
          object: 'nestedModel',
          in: {
            guests: {
              condition: 'Condition title 1',
            },
          },
        },
        nestedPerm2: {
          object: 'nestedModel',
          in: {
            guests: {
              condition: 'Condition title 2',
            },
          },
        },
        // test cached condition
        nestedPerm2Duplicate: {
          object: 'nestedModel',
          in: {
            guests: {
              condition: 'Condition title 2',
            },
          },
        },
        nestedPerm3: {
          object: 'nestedModel',
          in: {
            guests: {
              condition: 'Condition title 3',
            },
          },
        },
        // test unknown condition
        nestedPerm4: {
          object: 'nestedModel',
          in: {
            guests: {
              condition: 'Unknown condition',
            },
          },
        },
      },
    });

    // find conditions mock
    sandbox
      .stub(conditionRepository, 'findOne')
      .onCall(0)
      // Condition title 1
      .resolves({
        conditions: { template: '<%= entity.nestedAllow.nested === false %>' },
      } as Condition)
      .onCall(1)
      // Condition title 2
      .resolves({
        conditions: { template: '<%= value.should === "" %>' },
      } as Condition)
      .onCall(2)
      // Condition title 3
      .resolves({
        conditions: { template: "<%= _.get(value, '0.test') === 1 %>" },
      } as Condition)
      // Unknown condition
      .onCall(3)
      .resolves(undefined);

    // resolve nestedModel schema on first call
    TypeormMock.entityManager.findOne.resolves(allowAllModel);

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({
      nestedAllow: input.nestedAllow,
      nestedPartial: {
        part1: 'hi',
      },
      nestedModel: {
        hello: 'model',
      },
      nestedPerm1: {
        should: 'not-empty',
      },
      nestedPerm3: [
        {
          test: 1,
        },
        {
          test: 2,
        },
      ],
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

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({ userId: '' });
  });

  it('should correctly filter field', async () => {
    const input = {
      userId: 'user-100',
      someField: '',
      testField: 'test-field',
    };
    const templateOptions = { payload: { it: 'payload' } };
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
        testField: {
          in: {
            guests: FieldPolicy.deny,
            users: {
              // allow only if userId from entity equal userId from authentication microservice
              template: '<%= entity.userId === current.userId ? value : "undefined" %>',
            },
          },
          out: {
            users: {
              // allow only if userId from entity equal userId from authentication microservice
              template: '<%= entity.userId === current.userId ? value : "undefined" %>',
            },
          },
        },
        someField: {
          in: { users: { template: "<%= _.get(params, 'payload.it', 'undefined') %>" } },
        },
      },
    });
    const srv = FieldsFilter.init({
      userId: input.userId,
      userRoles,
      modelRepository,
      conditionRepository,
      conditionChecker,
      templateOptions,
    });

    expect(await service.filter(FilterType.IN, model, input)).to.deep.equal({});
    expect(await srv.filter(FilterType.IN, model, input)).to.deep.equal({
      userId: input.userId,
      testField: input.testField,
      someField: templateOptions.payload.it,
    });
    expect(await service.filter(FilterType.OUT, model, input)).to.deep.equal({
      userId: input.userId,
    });
  });

  it('should correctly filter field: dynamic schema', async () => {
    const input1 = {
      value: {
        test1: {
          user: 'name',
          email: 'email',
        },
      },
    };
    const input2 = {
      value: {
        test2: {
          response: {
            test: true,
            private: 'private',
          },
        },
      },
    };
    const input1Model = modelRepository.create({
      alias: 'aliasToInput1',
      schema: {
        test1: {
          object: {
            user: {
              in: { users: FieldPolicy.allow },
              out: { users: FieldPolicy.allow },
            },
            email: {
              in: { admins: FieldPolicy.allow },
              out: { admins: FieldPolicy.allow },
            },
          },
        },
      },
    });
    const input2Model = modelRepository.create({
      alias: 'aliasToInput2',
      schema: {
        test2: {
          object: {
            response: {
              object: {
                test: {
                  in: { users: FieldPolicy.deny },
                  out: { users: FieldPolicy.allow },
                },
                private: {
                  in: { admins: FieldPolicy.deny },
                  out: { admins: FieldPolicy.allow },
                },
              },
            },
          },
        },
      },
    });
    const getModel = (modelAlias = 'input1') =>
      modelRepository.create({
        alias: 'alias',
        schema: {
          value: {
            case: {
              template: `<%= "${modelAlias}" %>`,
            },
            object: {
              input1: 'aliasToInput1',
              input2: 'aliasToInput2',
            },
          },
        },
      });

    // resolve allow schema on first call (on second call return cached schema)
    TypeormMock.entityManager.findOne.callsFake((...args) => {
      const [, { alias }] = args;

      if (alias === 'aliasToInput1') {
        return input1Model;
      } else if (alias === 'aliasToInput2') {
        return input2Model;
      }

      return null;
    });

    const res1 = await service.filter(FilterType.OUT, getModel(), input1);
    const res2 = await service.filter(FilterType.OUT, getModel('input2'), input2);
    const res3 = await service.filter(FilterType.IN, getModel('input2'), input2);
    const res4 = await service.filter(FilterType.IN, getModel(), input2); // mismatch input data and caseValue

    expect(res1).to.deep.equal({
      value: {
        test1: {
          user: 'name',
        },
      },
    });
    expect(res2).to.deep.equal({
      value: {
        test2: {
          response: {
            test: true,
          },
        },
      },
    });
    expect(res3).to.deep.equal({
      value: {
        test2: {
          response: {},
        },
      },
    });
    expect(res4).to.deep.equal({});
  });
});

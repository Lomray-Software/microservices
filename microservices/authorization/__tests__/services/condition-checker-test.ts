import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { BaseException, Microservice, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import ConditionChecker from '@services/condition-checker';
import type { ICondition, IConditions } from '@services/condition-checker';

describe('services/condition-checker', () => {
  const sandbox = sinon.createSandbox();
  const ms = Microservice.create();
  const templateParams = { hello: 'world', forSwitch: 'case1' };

  const getService = () => new ConditionChecker(ms, { ...templateParams });

  afterEach(() => {
    TypeormMock.sandbox.reset();
    sandbox.restore();
  });

  it('should return "false" with empty condition', async () => {
    expect(await getService().execConditions({})).to.false;
  });

  it('should correctly exec direct condition', async () => {
    const condition: ICondition = {
      template: "<%= hello === 'world' %>", // use template params
    };

    expect(await getService().execConditions(condition)).to.true;
  });

  it('should correctly dynamically add template params', () => {
    const service = getService();
    const params = { extra: 'param' };

    service.addTemplateParams(params);

    expect(service)
      .to.have.property('templateParams')
      .deep.equal({
        ...templateParams,
        ...params,
      });
  });

  it('should correctly exec direct condition with requests (parallel and not parallel)', async () => {
    const condition: ICondition = {
      requests: {
        testSwitch: {
          switch: {
            value: '<%= forSwitch %>',
            cases: {
              case1: {
                method: "<%= _.join(['microservice', hello], '.') %>",
                params: {
                  query: {
                    where: {
                      hello: '<%= hello %>',
                    },
                  },
                },
              },
            },
          },
        },
        entity: {
          method: 'microservice.demo',
        },
        entityError: {
          method: 'microservice.not-available',
        },
        entityParallel: {
          isParallel: true,
          method: 'microservice.parallel1',
        },
        entityParallel2: {
          isParallel: true,
          method: 'microservice.parallel2',
        },
      },
      template:
        "<%= _.get(testSwitch, 'prop1') === 1 && _.get(entity, 'id') === 2 && _.isEmpty(entityError) && _.get(entityParallel, 'prop') === 'test' && _.get(entityParallel2, 'prop2') === 'test2' %>", // use template params
    };
    const testSwitch = { prop1: 1 };
    const entity = { id: 2 };
    const entityParallel = { prop: 'test' };
    const entityParallel2 = { prop2: 'test2' };

    const stubRequests = sandbox
      .stub(ms, 'sendRequest')
      .onCall(0)
      .resolves(new MicroserviceResponse({ result: testSwitch }))
      .onCall(1)
      .resolves(new MicroserviceResponse({ result: entity }))
      .onCall(2)
      .resolves(new MicroserviceResponse({ error: new BaseException() }))
      .onCall(3)
      .resolves(new MicroserviceResponse({ result: entityParallel }))
      .onCall(4)
      .resolves(new MicroserviceResponse({ result: entityParallel2 }));

    const isAllow = await getService().execConditions(condition);
    const call1 = stubRequests.getCall(0).args;

    expect(isAllow).to.true;
    expect(call1).to.deep.equal([
      'microservice.world',
      { query: { where: { hello: templateParams.hello } } },
    ]);
  });

  it('should correctly exec junction "or" conditions', async () => {
    const conditions: IConditions = {
      // one of condition should be true
      or: [{ template: '<%= 3 === 3 %>' }, { template: '<%= 1 === 2 %>' }],
    };

    expect(await getService().execConditions(conditions)).to.true;
  });

  it('should correctly exec junction "and" conditions', async () => {
    const conditions: IConditions = {
      // all conditions should be true
      or: [{ template: '<%= 5 === 5 %>' }, { template: '<%= 2 === 2 %>' }],
    };

    expect(await getService().execConditions(conditions)).to.true;
  });

  it('should correctly exec nested junction conditions', async () => {
    const conditions: IConditions = {
      and: [
        { template: '<%= 1 === 1 %>' },
        { or: [{ template: '<%= 2 === 1 %>' }, { template: '<%= 1 === 1 %>' }] },
      ],
    };

    expect(await getService().execConditions(conditions)).to.true;
  });
});

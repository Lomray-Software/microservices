import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonSpy } from 'sinon';
import OriginalEndpointFilter from '@methods/endpoint/filter';
import EndpointHandler, { IEndpointHandlerParams } from '@services/endpoint-handler';
import { FilterType } from '@services/fields-filter';

const { default: Filter } = rewiremock.proxy<{
  default: typeof OriginalEndpointFilter;
}>(() => require('@methods/endpoint/filter'), {
  typeorm: TypeormMock.mock,
});

describe('methods/endpoint/filter', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Filter({}, endpointOptions);

    expect(await waitResult(res)).to.throw('invalid request params');
  });

  it('should correctly filter params', async () => {
    const userId = 'demo-user-id';
    const cases = [FilterType.IN, FilterType.OUT];

    for (const type of cases) {
      let endpointHandlerSpy: SinonSpy | undefined;
      let endpointHandlerMethod: string | undefined;
      let endpointHandlerParams: IEndpointHandlerParams | undefined;
      const endpointHandlerInitStub = sandbox
        .stub(EndpointHandler, 'init')
        .callsFake((method, params) => {
          endpointHandlerInitStub.restore();

          const endpointHandlerService = EndpointHandler.init(method, params);

          endpointHandlerMethod = method;
          endpointHandlerParams = params;
          endpointHandlerSpy = sandbox.spy(endpointHandlerService, 'filterFields');

          return endpointHandlerService;
        });
      const filterInput = { hi: 'test-input' };
      const method = 'demo.test.m';

      const res = await Filter({ type, filterInput, method, userId }, endpointOptions);

      const [resType, resInput] = endpointHandlerSpy?.firstCall.args ?? [];

      const {
        userId: filterUserId,
        hasFilters,
        hasFilterInput,
        hasFilterOutput,
      } = endpointHandlerParams ?? {};

      expect(filterUserId).to.equal(userId);
      expect(endpointHandlerMethod).to.equal(method);
      expect(hasFilters).to.false;
      expect(hasFilterInput).to.equal(type === FilterType.IN);
      expect(hasFilterOutput).to.equal(type === FilterType.OUT);

      expect(resType).to.equal(type);
      expect(resInput).to.equal(filterInput);
      expect(res).to.deep.equal({ filtered: {} });
    }
  });
});

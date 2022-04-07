import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonSpy } from 'sinon';
import OriginalEndpointEnforce from '@methods/endpoint/enforce';
import EndpointHandler, { IEndpointHandlerParams } from '@services/endpoint-handler';

const { default: Enforce } = rewiremock.proxy<{
  default: typeof OriginalEndpointEnforce;
}>(() => require('@methods/endpoint/enforce'), {
  typeorm: TypeormMock.mock,
});

describe('methods/endpoint/enforce', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Enforce({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should return enforce check', async () => {
    const userId = 'demo-user-id';
    const cases = [
      { filterInput: { hello: 'world' }, isAllowed: true },
      { filterInput: undefined, hasFilters: false, isAllowed: true },
      { filterInput: { another: 'case' }, hasFilters: true, isAllowed: false },
    ];

    for (const { filterInput, isAllowed, hasFilters } of cases) {
      let endpointHandlerSpy: SinonSpy | undefined;
      let methodFiltersSpy: SinonSpy | undefined;
      let filterFieldsSpy: SinonSpy | undefined;
      let endpointHandlerMethod: string | undefined;
      let endpointHandlerParams: IEndpointHandlerParams | undefined;
      const endpointHandlerInitStub = sandbox
        .stub(EndpointHandler, 'init')
        .callsFake((method, params) => {
          endpointHandlerInitStub.restore();

          const endpointHandlerService = EndpointHandler.init(method, params);

          endpointHandlerMethod = method;
          endpointHandlerParams = params;
          endpointHandlerSpy = sandbox
            .stub(endpointHandlerService, 'isMethodAllowed')
            .resolves(isAllowed);
          methodFiltersSpy = sandbox.spy(endpointHandlerService, 'getMethodFilters');
          filterFieldsSpy = sandbox.spy(endpointHandlerService, 'filterFields');

          return endpointHandlerService;
        });
      const method = 'demo.test.m';

      const res = await Enforce({ userId, method, filterInput, hasFilters }, endpointOptions);

      const [shouldThrowReq] = endpointHandlerSpy?.firstCall.args ?? [];

      const {
        userId: filterUserId,
        hasFilters: isInitHasFilters,
        hasFilterInput,
        hasFilterOutput,
      } = endpointHandlerParams ?? {};

      const shouldCallMethodFilters = isAllowed && isInitHasFilters;
      const shouldCallFilters = isAllowed && Boolean(filterInput);

      // service init params
      expect(filterUserId).to.equal(userId);
      expect(endpointHandlerMethod).to.equal(method);
      expect(isInitHasFilters).to.equal(hasFilters ?? true);
      expect(hasFilterInput).to.equal(Boolean(filterInput));
      expect(hasFilterOutput).to.false;

      expect(shouldThrowReq).to.equal(true);

      expect(methodFiltersSpy?.getCalls().length === 1).to.equal(shouldCallMethodFilters);
      expect(filterFieldsSpy?.getCalls().length === 1).to.equal(shouldCallFilters);

      expect(res).to.deep.equal({
        isAllow: isAllowed,
        roles: [undefined],
        filters: shouldCallMethodFilters ? { where: {} } : undefined,
        filteredInput: shouldCallFilters ? {} : undefined,
      });
    }
  });
});

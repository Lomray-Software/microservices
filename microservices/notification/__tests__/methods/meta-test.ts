import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalMetaHandler from '@methods/meta';

const { default: MetaHandler } = rewiremock.proxy<{
  default: typeof OriginalMetaHandler;
}>(() => require('@methods/meta'), {
  typeorm: TypeormMock.mock,
});

describe('methods/meta', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  const app = Microservice.create();

  it('should correctly return microservice metadata', async () => {
    const res = await MetaHandler({}, { ...endpointOptions, app });

    expect(res).to.have.property('endpoints');
    expect(res).to.have.property('entities');
  });
});

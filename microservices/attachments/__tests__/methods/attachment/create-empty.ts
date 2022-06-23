import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import AttachmentType from '@constants/attachment-type';
import OriginalEndpointCreateEmpty from '@methods/attachment/create-empty';

const { default: Create } = rewiremock.proxy<{
  default: typeof OriginalEndpointCreateEmpty;
}>(() => require('@methods/attachment/create-empty'), {
  typeorm: TypeormMock.mock,
});

describe('methods/attachment/create-empty', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Create({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Validation failed for one or more entities.');
  });

  it('should correctly create attachment', async () => {
    const fields = {
      userId: 'user_id',
      type: AttachmentType.image,
      url: '/',
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Create({ fields }, endpointOptions);

    expect(res?.entity).to.deep.equal(fields);
  });
});

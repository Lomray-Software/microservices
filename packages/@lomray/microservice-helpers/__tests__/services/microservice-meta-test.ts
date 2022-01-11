import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import { IsString } from 'class-validator';
import { MicroserviceMeta } from '@services/microservice-meta';

class EndpointsTestEntity {
  @IsString()
  id: string;
}

describe('services/microservice-meta', () => {
  const ms = Microservice.create();

  const handlerWithoutMeta = () => ({});
  const handlerWithMeta = () => ({});
  const handlerWithMetaOptions = { isPrivate: true };

  handlerWithMeta.getMeta = () => ({
    input: ['TestName', undefined],
    output: [EndpointsTestEntity.name, { param: 1 }],
  });

  ms.addEndpoint('test-endpoint', handlerWithoutMeta);
  ms.addEndpoint('test-endpoint-with-meta', handlerWithMeta, handlerWithMetaOptions);

  it('should return endpoints meta', () => {
    expect(MicroserviceMeta.getMeta(ms.getEndpoints())).to.deep.equal({
      endpoints: {
        'test-endpoint': {
          options: { isDisableMiddlewares: false, isPrivate: false },
          input: undefined,
          output: undefined,
        },
        'test-endpoint-with-meta': {
          options: { isDisableMiddlewares: false, isPrivate: true },
          input: ['TestName', undefined],
          output: [
            'EndpointsTestEntity',
            {
              param: 1,
            },
          ],
        },
      },
      entities: {
        EndpointsTestEntity: {
          properties: { id: { type: 'string' } },
          type: 'object',
          required: ['id'],
        },
      },
    });
  });
});

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
    description: 'description',
  });

  ms.addEndpoint('test-endpoint', handlerWithoutMeta);
  ms.addEndpoint('test-endpoint-with-meta', handlerWithMeta, handlerWithMetaOptions);

  it('should return endpoints meta', () => {
    const res = MicroserviceMeta.getMeta(ms.getEndpoints());

    expect(res.endpoints).to.deep.equal({
      'test-endpoint': {
        options: { isDisableMiddlewares: false, isPrivate: false },
        input: undefined,
        output: undefined,
        description: undefined,
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
        description: 'description',
      },
    });
    expect(res.entities).to.deep.contains({
      EndpointsTestEntity: {
        properties: { id: { type: 'string' } },
        type: 'object',
        required: ['id'],
      },
    });
  });
});

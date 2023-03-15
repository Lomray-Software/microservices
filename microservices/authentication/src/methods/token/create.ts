import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import getJwtOptions from '@config/jwt';
import Token from '@entities/token';
import {
  CreateAuthToken,
  TokenCreateInput,
  TokenCreateOutput,
} from '@services/methods/create-auth-token';

/**
 * Create auth token
 */
const create = Endpoint.custom(
  () => ({
    input: TokenCreateInput,
    output: TokenCreateOutput,
    description: 'Create authentication token',
  }),
  async (params) => {
    const origin = params.payload?.headers?.origin as string;
    const jwtOptions = await getJwtOptions([origin]);
    const service = new CreateAuthToken(getRepository(Token), jwtOptions);

    return service.create(params);
  },
);

export default create;

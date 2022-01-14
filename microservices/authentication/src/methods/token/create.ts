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
  }),
  async (params) => {
    const jwtOptions = await getJwtOptions();
    const service = new CreateAuthToken(getRepository(Token), jwtOptions);

    return service.create(params);
  },
);

export default create;

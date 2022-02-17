import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import getJwtOptions from '@config/jwt';
import Token from '@entities/token';
import {
  IdentifyAuthToken,
  TokenIdentifyInput,
  TokenIdentifyOutput,
} from '@services/methods/identity-auth-token';

/**
 * Identify auth token
 */
const identify = Endpoint.custom(
  () => ({
    input: TokenIdentifyInput,
    output: TokenIdentifyOutput,
    description: 'Identify authentication token',
  }),
  async ({ token, payload }) => {
    const jwtOptions = await getJwtOptions();
    const service = new IdentifyAuthToken(getRepository(Token), jwtOptions);

    return service.identify({ token }, payload?.headers);
  },
);

export default identify;

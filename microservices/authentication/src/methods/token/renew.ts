import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import getJwtOptions from '@config/jwt';
import Token from '@entities/token';
import {
  RenewAuthToken,
  TokenRenewInput,
  TokenRenewOutput,
} from '@services/methods/renew-auth-token';

/**
 * Renew auth token
 */
const renew = Endpoint.custom(
  () => ({
    input: TokenRenewInput,
    output: TokenRenewOutput,
    description: 'Renew authentication token',
  }),
  async (params) => {
    const jwtOptions = await getJwtOptions();
    const service = new RenewAuthToken(getRepository(Token), jwtOptions);

    return service.renew(params);
  },
);

export default renew;

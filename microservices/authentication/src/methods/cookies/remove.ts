import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean } from 'class-validator';

class CookiesRemoveOutput {
  @IsBoolean()
  isRemoved: boolean;
}

/**
 * Remove auth token from cookies
 */
const remove = Endpoint.custom(
  () => ({
    output: CookiesRemoveOutput,
    description: 'Remove auth token from cookies',
  }),
  () => ({
    isRemoved: true,
    payload: {
      cookies: [{ action: 'remove', name: 'jwt-access' }],
    },
  }),
);

export default remove;

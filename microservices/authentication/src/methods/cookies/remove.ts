import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean } from 'class-validator';
import cookies from '@config/cookies';

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
  async () => ({
    isRemoved: true,
    payload: {
      cookies: [
        {
          action: 'remove',
          name: 'jwt-access',
          options: { ...(await cookies()) },
        },
      ],
    },
  }),
);

export default remove;

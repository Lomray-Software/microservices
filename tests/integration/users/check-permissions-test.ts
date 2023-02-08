import { expect } from 'chai';
import { STATUS_CODE } from '@constants/index';
import Endpoints from '@helpers/api/endpoints';
import Commands from '@helpers/commands';
import type { TRequest } from '@interfaces/request';

describe('Check users microservice permissions', () => {
  const client = Endpoints.create();
  const commands = Commands.create(client);
  let token: string;

  before(async () => {
    ({ token } = await commands.createUser({ firstName: 'John' }));
  });

  it('client have not access to these methods', async () => {
    const requests: TRequest[] = [
      client.users.user.signUp,
      client.users.user.changePassword,
      client.users.user.changeLogin,
      client.users.confirmCode.send,
    ];

    for (const request of requests) {
      const response = await request();

      expect(response.error?.status, response.error?.message).to.equal(
        STATUS_CODE.METHOD_NOT_ALLOWED,
      );
    }
  });

  it('client have access to these methods', async () => {
    const requests: TRequest[] = [
      client.users.user.view,
      client.users.user.me,
      client.users.profile.view,
    ];

    for (const request of requests) {
      const response = await request({}, { authToken: token });

      expect(response.error, response.error?.message).to.undefined;
    }
  });
});

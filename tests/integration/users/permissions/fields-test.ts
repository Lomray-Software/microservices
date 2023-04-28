import type IUser from '@lomray/microservices-client-api/interfaces/users/entities/user';
import { expect } from 'chai';
import Endpoints from '@helpers/api/endpoints';
import Commands from '@helpers/commands';

describe('Check users fields permissions', () => {
  const client = Endpoints.create();
  const commands = Commands.create(client);
  let authToken1: string;
  let user1: IUser, user2: IUser;

  before(async () => {
    ({ token: authToken1, user: user1 } = await commands.users.createUser(
      {
        firstName: 'John',
        ...commands.users.getRandomFields(),
      },
      { isOnlyToken: false, withIdentityProvider: true },
    ));
    ({ user: user2 } = await commands.users.createUser(
      {
        firstName: 'Anna',
        ...commands.users.getRandomFields(),
      },
      { isOnlyToken: false, withIdentityProvider: true },
    ));

    await commands.authorization.detachFilters('user.view', ['By user id: ignore admin']);
  });

  after(async () => {
    await commands.authorization.rollback();
  });

  it('the user does not have access to the fields of another user', async () => {
    // John try to view fields Anna's
    const { result: { entity } = {} } = await client.users.user.view(
      {
        query: {
          relations: ['identityProviders'],
          where: { id: user2.id },
        },
      },
      { authToken: authToken1 },
    );

    const { id, email, phone, identityProviders } = entity!;

    expect(id).to.equal(user2.id);
    expect(email).to.undefined;
    expect(phone).to.undefined;
    expect(identityProviders).to.undefined;
  });

  it('the user have access to the own fields', async () => {
    const { result: { entity } = {} } = await client.users.user.view(
      {
        query: {
          relations: ['identityProviders'],
          where: { id: user1.id },
        },
      },
      { authToken: authToken1 },
    );

    const { id, email, phone, identityProviders: [identityProvider] = [] } = entity!;

    expect(id).to.equal(user1.id);
    expect(email).to.equal(user1.email);
    expect(phone).to.equal(user1.phone);
    expect(identityProvider.userId).to.equal(user1.id);
  });
});

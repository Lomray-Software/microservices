import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import Method from '@entities/method';
import RolesTree from '@entities/roles-tree';
import UserRole from '@entities/user-role';
import Enforcer from '@services/enforcer';

describe('services/enforcer', () => {
  const sandbox = sinon.createSandbox();
  const userId = 'user-id';
  const methodRepository = TypeormMock.entityManager.getRepository(Method);
  const userRoleRepository = TypeormMock.entityManager.getRepository(UserRole);
  const rolesTreeRepository = TypeormMock.entityManager.getRepository(RolesTree);
  const service = Enforcer.init({
    userId,
    defaultRole: 'users',
    userRoleRepository,
    rolesTreeRepository,
  });

  afterEach(() => {
    TypeormMock.sandbox.reset();
    sandbox.restore();
  });

  it('should return "false" with empty method', async () => {
    expect(await service.enforce(undefined, false)).to.false;
  });

  it('should throw error with empty method', async () => {
    expect(await waitResult(service.enforce(undefined))).to.throw('Method not allowed');
  });

  it('should correctly check access to method', async () => {
    sandbox.stub(service, 'findUserRoles').resolves({
      userId,
      roles: ['users', 'guests'],
    });
    const cases = [
      { denyGroup: [], allowGroup: [], should: false },
      { denyGroup: ['users'], allowGroup: [], should: false },
      { denyGroup: ['users'], allowGroup: ['users'], should: false },
      { denyGroup: [userId], allowGroup: ['users'], should: false },
      { denyGroup: ['guests'], allowGroup: ['users'], should: false }, // because users nested from guests
      { denyGroup: [], allowGroup: ['users'], should: true },
      { denyGroup: [], allowGroup: [userId], should: true },
    ];

    for (const { denyGroup, allowGroup, should } of cases) {
      const method = methodRepository.create({ method: 'demo.test', denyGroup, allowGroup });
      const isAllow = await service.enforce(method, false);

      expect(isAllow).to.be.equal(should);
    }
  });

  it('should throw error if access to method denied', async () => {
    sandbox.stub(service, 'findUserRoles').resolves({
      userId,
      roles: [],
    });

    const method = methodRepository.create({ method: 'demo.test' });

    expect(await waitResult(service.enforce(method))).to.throw('Method not allowed');
  });

  it('should correctly return user roles', async () => {
    sandbox
      .stub(userRoleRepository, 'findOne')
      .resolves(userRoleRepository.create({ userId, roleAlias: 'users' }));

    const spyTreeFind = sandbox
      .stub(rolesTreeRepository, 'findOne')
      .resolves(rolesTreeRepository.create({ path: ['users', 'guests'] }));

    const result = await service.findUserRoles();

    expect(result.userId).to.equal(userId);
    expect(result.roles).to.deep.equal(['users', 'guests']);
    expect(spyTreeFind.firstCall.firstArg).to.deep.equal({ alias: 'users' });
  });

  // NOTE: this case should be after 'findUserRoles'
  it('should return cached user roles', async () => {
    const spyFindRole = sandbox.stub(userRoleRepository, 'findOne');
    const result = await service.findUserRoles();

    expect(spyFindRole).to.not.called;
    expect(result.userId).to.equal(userId);
    expect(result.roles).to.deep.equal(['users', 'guests']);
  });

  it('should return "guest" role when userId not set', async () => {
    const localService = Enforcer.init({
      userRoleRepository,
      rolesTreeRepository,
      defaultRole: 'default',
    });

    const result = await localService.findUserRoles();

    expect(result).to.deep.equal({ userId: undefined, roles: ['guest'] });
  });

  it('should return default role for user', async () => {
    sandbox.stub(userRoleRepository, 'findOne').resolves(undefined);

    const localService = Enforcer.init({
      userRoleRepository,
      rolesTreeRepository,
      defaultRole: 'user',
      userId: '123',
    });

    const result = await localService.findUserRoles();

    expect(result).to.deep.equal({
      roles: ['user'],
      userId: '123',
    });
  });
});

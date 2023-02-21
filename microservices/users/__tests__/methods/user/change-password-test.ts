import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonStub } from 'sinon';
import { Repository } from 'typeorm';
import User from '@entities/user';
import { changePassword as OriginalEndpointChangePassword } from '@methods/user/change-password';
import ChangePasswordService, { ChangePasswordParams } from '@services/change-password';

const { changePassword: ChangePassword } = rewiremock.proxy<{
  changePassword: typeof OriginalEndpointChangePassword;
}>(() => require('@methods/user/change-password'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/change-password', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    const params = [
      {},
      {
        userId: 'userId',
        newPassword: '1',
        confirmCode: 'unknown',
      },
      {
        userId: 'userId',
        newPassword: '1',
        oldPassword: '1',
        confirmCode: 'unknown',
      },
      {
        userId: 'userId',
        newPassword: '1',
        confirmBy: 'email',
      },
      {
        login: 'login',
        newPassword: '1',
        confirmBy: 'email',
      },
    ];

    for (const caseParams of params) {
      // @ts-ignore
      const res = ChangePassword(caseParams, endpointOptions);

      expect(await waitResult(res)).to.throw('Invalid request params');
    }
  });

  it('should correctly change password', async () => {
    let serviceParams: ChangePasswordParams | undefined;
    let changeStub: SinonStub | undefined;

    const mockUser = TypeormMock.entityManager.getRepository(User).create({ id: 'test-id' });
    const changePasswordStub = sandbox.stub(ChangePasswordService, 'init').callsFake((params) => {
      changePasswordStub.restore();

      const service = ChangePasswordService.init(params);

      serviceParams = params;
      changeStub = sandbox.stub(service, 'change').resolves(mockUser);

      return service;
    });
    const methodParams = {
      userId: 'user-id',
      newPassword: 'new-password',
      oldPassword: 'old-password',
    };

    const res = await ChangePassword(methodParams, endpointOptions);

    // change password service
    expect(res).to.deep.equal({ isChanged: true });
    expect(methodParams.userId).to.deep.equal(serviceParams?.userId);
    expect(serviceParams?.repository).to.instanceof(Repository);
    expect(typeof serviceParams?.['isConfirmed']).to.equal('function');
    expect(changeStub).to.calledOnceWith(methodParams.newPassword, methodParams.oldPassword);

    // because 'confirmBy' not set
    const isUndefined = await serviceParams?.isConfirmed?.({} as never);

    // confirm service
    expect(isUndefined).to.undefined;
  });
});

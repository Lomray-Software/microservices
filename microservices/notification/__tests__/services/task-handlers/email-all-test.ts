import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import EmailAll from '@services/task-handlers/email-all';

describe('services/task-handlers/email-all', () => {
  const sandbox = sinon.createSandbox();
  let apiGet: sinon.SinonStub;
  let emailAll: EmailAll;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
    emailAll = new EmailAll(TypeormMock.entityManager);
    apiGet = sinon.stub(Api, 'get');
  });

  afterEach(() => {
    sandbox.restore();
    apiGet.restore();
  });

  describe('take', () => {
    it('should correctly return false: task type is not email all', () => {
      expect(emailAll.take([taskMock])).to.false;
    });

    it('should correctly return true: task type is email all', () => {
      expect(emailAll.take([{ ...taskMock, type: TaskType.EMAIL_ALL }])).to.true;
    });
  });
});

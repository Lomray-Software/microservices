import TypeormMock from '@lomray/microservice-helpers/mocks/typeorm';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalConfigRepository from '@repositories/config-repository';

const { default: ConfigRepository } = rewiremock.proxy<{
  default: typeof OriginalConfigRepository;
}>(() => require('@repositories/config-repository'), {
  typeorm: TypeormMock.mock,
});

class ConfigRepositoryMock extends ConfigRepository {
  bulkSave = sinon.stub();
}

export default ConfigRepositoryMock;

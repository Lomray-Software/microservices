import rewiremock from 'rewiremock';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();
const stubs = {
  createDatabase: sandbox.stub().resolves(),
};

const TypeormExtensionMock = {
  sandbox,
  stubs,
  mock: rewiremock('typeorm-extension').callThrough().with(stubs),
};

export default TypeormExtensionMock;

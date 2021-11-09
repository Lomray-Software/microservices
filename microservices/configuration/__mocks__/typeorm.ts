import rewiremock from 'rewiremock';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();
const stubs = {
  createConnection: sandbox.stub().resolves(),
};

const TypeormMock = {
  sandbox,
  stubs,
  mock: rewiremock('typeorm').callThrough().with(stubs),
};

export default TypeormMock;

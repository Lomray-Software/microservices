import rewiremock from 'rewiremock';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();
const stubs = {
  createDatabase: sandbox.stub().resolves(),
};

const TypeormExtension = {
  sandbox,
  stubs,
  mock: rewiremock('typeorm-extension').callThrough().with(stubs) as any,
};

export default TypeormExtension;

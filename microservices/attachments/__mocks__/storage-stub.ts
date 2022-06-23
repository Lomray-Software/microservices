import sinon from 'sinon';

const StorageStub = {
  upload: sinon.stub(),
  delete: sinon.stub(),
  getDomain: sinon.stub(),
};

export default StorageStub;

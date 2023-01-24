import sinon from 'sinon';

const StorageStub = {
  upload: sinon.stub(),
  delete: sinon.stub(),
  getDomain: sinon.stub(),
  handleUrl: sinon.stub(),
};

export default StorageStub;

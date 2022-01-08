import { Log } from '@lomray/microservice-helpers';
import sinon from 'sinon';

before(() => {
  sinon.stub(console, 'info');
  Log.configure({ silent: true });
  Log.transports.find((transport) => Log.remove(transport));
});

after(() => {
  sinon.restore();
});

import chai from 'chai';
import sinonChai from 'sinon-chai';
import Log from '@services/log';

chai.use(sinonChai);
Log.configure({ silent: true });

import { expect } from 'chai';
import Log from '@services/log';

describe('services/log', () => {
  it('should be instance of winston log', () => {
    expect(Log.constructor.name).to.equal('DerivedLogger');
  });
});

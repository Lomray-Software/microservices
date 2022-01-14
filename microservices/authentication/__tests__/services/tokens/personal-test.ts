import { expect } from 'chai';
import PersonalToken from '@services/tokens/personal';

describe('services/tokens/personal-token', () => {
  it('should correctly generate personal access token', () => {
    const token = PersonalToken.generate();
    const token2 = PersonalToken.generate();

    expect(token).to.length(32);
    expect(token).to.not.equal(token2);
  });
});

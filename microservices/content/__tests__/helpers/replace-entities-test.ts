import { expect } from 'chai';
import sinon from 'sinon';
import replaceEntities from '@helpers/replace-entities';

describe('helpers/replace-entities', () => {
  const originalEntities = [
    { cardId: 1, userId: 2 },
    { cardId: 2, userId: 3 },
  ];

  it('should update original data with matching values from updated data', () => {
    const updatedEntities = [
      { cardId: 1, userId: 2, name: 'Alex' },
      { cardId: 2, userId: 3, name: 'Oleg' },
    ];

    const result = replaceEntities(originalEntities, updatedEntities);

    expect(result).to.deep.equal(updatedEntities);
  });

  it('should return empty array if matches not found and should clear is true', () => {
    const updatedData = [
      { cardId: 1, userId: 5, name: 'Alex' },
      { cardId: 2, userId: 5, name: 'Oleg' },
    ];

    const result = replaceEntities(originalEntities, updatedData);

    expect(result).to.deep.equal([]);
  });

  it('should return empty original entities if matches not found and should clear is true', () => {
    const updatedData = [
      { cardId: 1, userId: 5, name: 'Alex' },
      { cardId: 2, userId: 5, name: 'Oleg' },
    ];

    const result = replaceEntities(originalEntities, updatedData, false);

    expect(result).to.deep.equal(originalEntities);
  });

  it('should update original data with matching values', () => {
    const spy = sinon.spy(Object, 'assign');
    const usersData = [{ id: 'id-1' }, { id: 'id-2' }];
    const usersResultData = [
      { id: 'id-1', name: 'Alex' },
      { id: 'id-2', name: 'Oleg' },
    ];

    const result = replaceEntities(usersData, usersResultData);

    expect(result).to.deep.equal(usersData);
    expect(spy.callCount).to.equal(2);
    spy.restore();
  });
});

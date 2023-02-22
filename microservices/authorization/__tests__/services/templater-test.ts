import { expect } from 'chai';
import Templater from '@services/templater';

describe('services/templater', () => {
  it('should template array return type', () => {
    const result = Templater.compile(
      {
        test: {
          field: "$array:[<%= userIds.join(',') %>]",
          hello: 'world',
        },
      },
      {
        userIds: [1, 2],
      },
    );

    expect(result).to.deep.equal({
      test: {
        field: [1, 2],
        hello: 'world',
      },
    });
  });

  it('should template object return type', () => {
    const result = Templater.compile({
      test: {
        field: "$object:<%= JSON.stringify({ test: 'test' }) %>",
        hello: 'world',
      },
    });

    expect(result).to.deep.equal({
      test: {
        field: {
          test: 'test',
        },
        hello: 'world',
      },
    });
  });

  it('should template number return type', () => {
    const result = Templater.compile({
      test: {
        field: '$number:<%= 4 %>',
        hello: 'world',
      },
    });

    expect(result).to.deep.equal({
      test: {
        field: 4,
        hello: 'world',
      },
    });
  });

  it('should template boolean return type', () => {
    const result = Templater.compile({
      test: {
        field: '$boolean:<%= 1 === 1 %>',
        hello: 'world',
      },
    });

    expect(result).to.deep.equal({
      test: {
        field: true,
        hello: 'world',
      },
    });
  });
});

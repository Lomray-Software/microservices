import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import { FilterOperator } from '@constants/filter';
import MethodFiltersEntity from '@entities/method-filter';
import MethodFilters from '@services/method-filters';

describe('services/method-filters', () => {
  const methodFiltersRepo = TypeormMock.entityManager.getRepository(MethodFiltersEntity);

  const guests = methodFiltersRepo.create({
    roleAlias: 'guests',
    operator: FilterOperator.and,
    filter: {
      condition: {
        options: { maxPageSize: 10 },
        query: { where: { field: 1 } },
      },
    },
  });
  const users = methodFiltersRepo.create({
    roleAlias: 'users',
    operator: FilterOperator.and,
    filter: {
      condition: {
        query: { where: { userId: '{{ userId }}' } },
      },
    },
  });
  const admins = methodFiltersRepo.create({
    roleAlias: 'admins',
    operator: FilterOperator.only,
    filter: { condition: {} },
  });
  const methodFilters = [guests, users, admins];

  it('should correctly handler empty filters', () => {
    const userId = null;
    const userRoles = ['guests'];
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters([]);

    expect(filters).to.deep.equal({});
  });

  it('should correctly collect filters for method: guest role', () => {
    const userId = null;
    const userRoles = ['guests'];
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ field: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: users role', () => {
    const userId = 1;
    const userRoles = ['users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ field: 1 }, { userId: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: admins role', () => {
    const userId = 99;
    const userRoles = ['admins', 'users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({
      query: {},
    });
  });

  it('should correctly collect filters for method: test case #1', () => {
    const usersFilter = { ...users, operator: 'only' };
    const adminsFilter = methodFiltersRepo.create({
      roleAlias: 'admins',
      operator: FilterOperator.only,
      filter: { condition: { query: { where: { admin: 1 } } } },
    });

    const userId = 99;
    const userRoles = ['admins', 'users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters([
      usersFilter,
      adminsFilter,
    ]);

    expect(filters).to.deep.equal({
      query: {
        where: {
          admin: 1,
        },
      },
    });
  });

  it('should correctly collect filters for method: test case #2 (autodetect template variable type)', () => {
    const userId = 'string-user-id';
    const userRoles = ['users', 'guests']; // order matters
    const filters = MethodFilters.init({
      userRoles,
      templateOptions: { userId, nested: { hi: 'world', it: null } },
    }).getFilters([
      guests,
      admins,
      methodFiltersRepo.create({
        roleAlias: 'users',
        operator: FilterOperator.and,
        filter: {
          condition: {
            query: {
              where: {
                userId: '{{ userId }}',
                hi: '{{ nested.hi }}',
                it: '{{ nested.it }}',
                datetime: '{{ datetime }}',
              },
            },
          },
        },
      }),
    ]);

    // @ts-ignore
    const datetimeFilled = filters.query?.where?.and?.[1].datetime;

    expect(datetimeFilled.split('T')[0]).to.equal(new Date().toISOString().split('T')[0]);
    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [
            {
              field: 1,
            },
            {
              hi: 'world',
              it: null,
              userId: 'string-user-id',
              datetime: datetimeFilled,
            },
          ],
        },
      },
    });
  });

  it('should correctly collect filters for method: merge relations & attributes & groupBy', () => {
    const usersFilter = methodFiltersRepo.create({
      roleAlias: 'guests',
      operator: FilterOperator.and,
      filter: {
        condition: {
          options: { defaultPageSize: 20 },
          query: {
            attributes: ['id'],
            relations: ['test'] as never[],
          },
        },
      },
    });
    const extendFilter = methodFiltersRepo.create({
      roleAlias: 'users',
      operator: FilterOperator.and,
      filter: {
        condition: {
          options: { defaultPageSize: 50 },
          query: {
            attributes: ['name'],
            relations: [{ name: 'test2' }] as never[],
            groupBy: ['id'],
          },
        },
      },
    });

    const userRoles = ['admins', 'users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId: 99 } }).getFilters([
      usersFilter,
      extendFilter,
    ]);

    expect(filters).to.deep.equal({
      options: {
        defaultPageSize: 50,
      },
      query: {
        attributes: ['id', 'name'],
        groupBy: ['id'],
        relations: [
          'test',
          {
            name: 'test2',
          },
        ],
      },
    });
  });
});

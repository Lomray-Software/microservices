import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import MethodFiltersEntity, { FilterOperator } from '@entities/method-filter';
import MethodFilters from '@services/method-filters';

describe('services/method-filters', () => {
  const methodFiltersRepo = TypeormMock.entityManager.getRepository(MethodFiltersEntity);

  const guests = methodFiltersRepo.create({
    roleAlias: 'guests',
    operator: FilterOperator.and,
    filter: { condition: { field: 1 } },
  });
  const users = methodFiltersRepo.create({
    roleAlias: 'users',
    operator: FilterOperator.and,
    filter: { condition: { userId: '{{ userId }}' } },
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

    expect(filters).to.deep.equal({ and: [{ field: 1 }] });
  });

  it('should correctly collect filters for method: users role', () => {
    const userId = 1;
    const userRoles = ['users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({ and: [{ field: 1 }, { userId: 1 }] });
  });

  it('should correctly collect filters for method: admins role', () => {
    const userId = 99;
    const userRoles = ['admins', 'users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({});
  });

  it('should correctly collect filters for method: test case #1', () => {
    const usersFilter = { ...users, operator: 'only' };
    const adminsFilter = methodFiltersRepo.create({
      roleAlias: 'admins',
      operator: FilterOperator.only,
      filter: { condition: { admin: 1 } },
    });

    const userId = 99;
    const userRoles = ['admins', 'users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId } }).getFilters([
      usersFilter,
      adminsFilter,
    ]);

    expect(filters).to.deep.equal({ admin: 1 });
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
            userId: '{{ userId }}',
            hi: '{{ nested.hi }}',
            it: '{{ nested.it }}',
            datetime: '{{ datetime }}',
          },
        },
      }),
    ]);

    const datetimeFilled = filters?.and?.[1].datetime;

    expect(datetimeFilled.split('T')[0]).to.equal(new Date().toISOString().split('T')[0]);
    expect(filters).to.deep.equal({
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
    });
  });
});

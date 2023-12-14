import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import { allUserRolesMock } from '@__mocks__/user-roles';
import { FilterIgnoreType, FilterOperator } from '@constants/filter';
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
        query: { where: { isGuest: 1 } },
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
    filter: {
      condition: {
        query: { where: { isAdmin: 1 } },
      },
    },
  });
  const methodFilters = [guests, users, admins];
  const userId = 99;

  it('should correctly handler empty filters', () => {
    const userRoles = ['guests'];
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId: null } }).getFilters(
      [],
    );

    expect(filters).to.deep.equal({});
  });

  it('should correctly collect filters for method: guest role', () => {
    const userRoles = ['guests'];
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId: null } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ isGuest: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: users role', () => {
    const userRoles = ['users', 'guests']; // order matters
    const filters = MethodFilters.init({ userRoles, templateOptions: { userId: 1 } }).getFilters(
      methodFilters,
    );

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ isGuest: 1 }, { userId: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: admins role', () => {
    const filters = MethodFilters.init({
      userRoles: allUserRolesMock,
      templateOptions: { userId },
    }).getFilters(methodFilters);

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ isGuest: 1 }, { userId }, { isAdmin: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: collect for admins - except users filter', () => {
    const usersFilter = { ...users, operator: 'only' };
    const filters = MethodFilters.init({
      userRoles: allUserRolesMock,
      templateOptions: { userId },
    }).getFilters([methodFilters[0], usersFilter, methodFilters[2]]);

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ isGuest: 1 }, { isAdmin: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: stop propagate guest filter', () => {
    const guestFilter = {
      ...guests,
      filter: { ...guests.filter, ignore: { users: FilterIgnoreType.stop } },
    };
    const filters = MethodFilters.init({
      userRoles: allUserRolesMock,
      templateOptions: { userId },
    }).getFilters([guestFilter, methodFilters[1], methodFilters[2]]);

    expect(filters).to.deep.equal({
      query: {
        where: {
          and: [{ userId }, { isAdmin: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: ignore guest filter for admins', () => {
    const guestFilter = {
      ...guests,
      filter: { ...guests.filter, ignore: { admins: FilterIgnoreType.stop } },
    };
    const filters = MethodFilters.init({
      userRoles: allUserRolesMock,
      templateOptions: { userId },
    }).getFilters([guestFilter, methodFilters[1], methodFilters[2]]);

    expect(filters).to.deep.equal({
      query: {
        where: {
          and: [{ userId }, { isAdmin: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: ignore guest filter only for users', () => {
    const guestFilter = {
      ...guests,
      filter: { ...guests.filter, ignore: { users: FilterIgnoreType.only } },
    };
    const filters = MethodFilters.init({
      userRoles: allUserRolesMock,
      templateOptions: { userId },
    }).getFilters([guestFilter, methodFilters[1], methodFilters[2]]);

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [{ isGuest: 1 }, { userId }, { isAdmin: 1 }],
        },
      },
    });
  });

  it('should correctly collect filters for method: autodetect template variable type', () => {
    const userIdStr = 'string-user-id';
    const userRoles = ['users', 'guests']; // order matters
    const filters = MethodFilters.init({
      userRoles,
      templateOptions: { userId: userIdStr, nested: { hi: 'world', it: null } },
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
              },
            },
          },
        },
      }),
    ]);

    expect(filters).to.deep.equal({
      options: guests.filter.condition.options,
      query: {
        where: {
          and: [
            {
              isGuest: 1,
            },
            {
              hi: 'world',
              it: null,
              userId: userIdStr,
            },
          ],
        },
      },
    });
  });

  it('should correctly collect filters for method: merge relations & attributes & groupBy & options & methodOptions & payloadMethodOptions', () => {
    const usersFilter = methodFiltersRepo.create({
      roleAlias: 'guests',
      operator: FilterOperator.and,
      filter: {
        condition: {
          methodOptions: { isAllowMultiple: false },
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
          methodOptions: { isAllowMultiple: true },
          options: { defaultPageSize: 50 },
          query: {
            attributes: ['name'],
            relations: [{ name: 'test2' }] as never[],
            groupBy: ['id'],
          },
        },
      },
    });

    const filters = MethodFilters.init({
      userRoles: allUserRolesMock,
      templateOptions: {
        userId: 99,
        fields: {
          payload: { authorization: { filter: { methodOptions: { isAllowDistinct: true } } } },
        },
      },
    }).getFilters([usersFilter, extendFilter]);

    expect(filters).to.deep.equal({
      methodOptions: {
        isAllowMultiple: true,
        isAllowDistinct: true,
      },
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

  it('should correctly return condition init state: empty', () => {
    expect(
      MethodFilters.init({ userRoles: allUserRolesMock, templateOptions: {} })[
        'getConditionInitState'
      ](),
    ).to.deep.equal({});
  });

  it('should correctly return condition init state: payload filters - method options', () => {
    expect(
      MethodFilters.init({
        userRoles: allUserRolesMock,
        templateOptions: {
          fields: {
            payload: { authorization: { filter: { methodOptions: { isAllowDistinct: true } } } },
          },
        },
      })['getConditionInitState'](),
    ).to.deep.equal({
      methodOptions: {
        isAllowDistinct: true,
      },
    });
  });
});

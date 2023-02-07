import _ from 'lodash';
import { createConnection } from 'typeorm';
import Condition from '@entities/condition';
import Filter from '@entities/filter';
import Method from '@entities/method';
import MethodFilter from '@entities/method-filter';
import Model from '@entities/model';
import Role from '@entities/role';
import UserRole from '@entities/user-role';
import {
  DUMP_PATH_ROOT,
  DUMP_PATH_MODELS,
  DUMP_PATH_METHODS,
  getDumpEntities,
  saveDump,
} from './helpers';

/**
 * Create or update roles
 */
const createOrUpdateRoles = (roles: Role[]): void => {
  const dumpFilters = getDumpEntities('roles', DUMP_PATH_ROOT);
  const keepActual = _.intersectionBy(dumpFilters, roles, 'alias');
  const merged = _.merge(_.keyBy(keepActual, 'alias'), _.keyBy(roles, 'alias'));
  const values = _.values(merged).map((f) => _.omit(f, ['updatedAt']));

  saveDump(values, 'roles', DUMP_PATH_ROOT);
};

/**
 * Create or update user roles
 */
const createOrUpdateUserRoles = (userRoles: UserRole[]): void => {
  const dumpFilters = getDumpEntities('user-roles', DUMP_PATH_ROOT);
  const keepActual = _.intersectionBy(dumpFilters, userRoles, 'userId');
  const merged = _.merge(_.keyBy(keepActual, 'userId'), _.keyBy(userRoles, 'userId'));
  const values = _.values(merged).map((f) => _.omit(f, ['updatedAt']));

  saveDump(values, 'user-roles', DUMP_PATH_ROOT);
};

/**
 * Create or update filters
 */
const createOrUpdateFilters = (filters: Filter[]): void => {
  const dumpFilters = getDumpEntities('filters', DUMP_PATH_ROOT);
  const keepActual = _.intersectionBy(dumpFilters, filters, 'title');
  const merged = _.merge(_.keyBy(keepActual, 'title'), _.keyBy(filters, 'title'));
  const values = _.values(merged).map((f) => _.omit(f, ['id', 'updatedAt']));

  saveDump(values, 'filters', DUMP_PATH_ROOT);
};

/**
 * Create or update conditions
 */
const createOrUpdateConditions = (conditions: Condition[]): void => {
  const dumpFilters = getDumpEntities('conditions', DUMP_PATH_ROOT);
  const keepActual = _.intersectionBy(dumpFilters, conditions, 'title');
  const merged = _.merge(_.keyBy(keepActual, 'title'), _.keyBy(conditions, 'title'));
  const values = _.values(merged).map((f) => _.omit(f, ['id', 'updatedAt']));

  saveDump(values, 'conditions', DUMP_PATH_ROOT);
};

/**
 * Create or update models
 */
const createOrUpdateModels = (models: Model[]): void => {
  const groupedModels = _.groupBy(models, (m) => m.microservice || 'common');

  Object.entries(groupedModels).forEach(([microservice, msModels]) => {
    const dumpModels = getDumpEntities(microservice, DUMP_PATH_MODELS);
    const keepActual = _.intersectionBy(dumpModels, msModels, 'alias');
    const merged = _.merge(_.keyBy(keepActual, 'alias'), _.keyBy(msModels, 'alias'));
    const values = _.values(merged).map((f) => _.omit(f, ['id', 'updatedAt']));

    saveDump(values, microservice, DUMP_PATH_MODELS);
  });
};

/**
 * Create or update methods
 */
const createOrUpdateMethods = (methods: Method[]): void => {
  const groupedMethods = _.groupBy(methods, (m) => m.microservice || 'common');
  const uniqueKey = (m: Method) => `${m.microservice}:${m.method}`;

  Object.entries(groupedMethods).forEach(([microservice, msMethods]) => {
    const dumpMethods = getDumpEntities(microservice, DUMP_PATH_METHODS);
    const keepActual = _.intersectionBy(dumpMethods, msMethods, uniqueKey);
    const merged = _.merge(_.keyBy(keepActual, uniqueKey), _.keyBy(msMethods, uniqueKey));
    const values = _.values(merged)
      .map((f) => _.omit(f, ['id', 'modelInId', 'modelOutId', 'conditionId', 'updatedAt']))
      .map(({ modelIn, modelOut, methodFilters, condition, ...method }) => ({
        ...method,
        modelIn: modelIn?.alias,
        modelOut: modelOut?.alias,
        condition: condition?.title,
        methodFilters: methodFilters
          ?.map((f: MethodFilter) => _.omit(f, ['methodId', 'filterId', 'updatedAt']))
          // @ts-ignore
          .map(({ filter, ...fields }) => ({
            filterTitle: filter.title,
            ...fields,
          })),
      }));

    saveDump(values, microservice, DUMP_PATH_METHODS);
  });
};

/**
 * Get permission from DB and make json default permission files for migration
 */
const exportPermissions = async () => {
  const connection = await createConnection();
  const methodRepo = connection.getRepository(Method);
  const modelRepo = connection.getRepository(Model);
  const filtersRepo = connection.getRepository(Filter);
  const rolesRepo = connection.getRepository(Role);
  const userRolesRepo = connection.getRepository(UserRole);
  const conditionRepo = connection.getRepository(Condition);

  const filters = await filtersRepo.find();
  const roles = await rolesRepo.find();
  const condition = await conditionRepo.find();
  const userRoles = await userRolesRepo.find();
  const models = await modelRepo.find();
  const methods = await methodRepo.find({
    relations: ['modelOut', 'modelIn', 'methodFilters', 'methodFilters.filter', 'condition'],
  });

  createOrUpdateRoles(roles);
  createOrUpdateUserRoles(userRoles);
  createOrUpdateFilters(filters);
  createOrUpdateConditions(condition);
  createOrUpdateModels(models);
  createOrUpdateMethods(methods);

  return connection.close();
};

export default exportPermissions();

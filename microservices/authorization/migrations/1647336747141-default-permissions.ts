import { MigrationInterface, QueryRunner } from 'typeorm';
import { MS_DEFAULT_PERMISSION_MIGRATION } from '@constants/index';
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
  getDumpEntitiesInFiles,
} from './permissions/helpers';

export default class defaultPermissions1647336747141 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!MS_DEFAULT_PERMISSION_MIGRATION) {
      return;
    }

    const { manager } = queryRunner;
    const methodRepo = manager.getRepository(Method);
    const modelRepo = manager.getRepository(Model);
    const conditionRepo = manager.getRepository(Condition);
    const filtersRepo = manager.getRepository(Filter);
    const methodFilterRepo = manager.getRepository(MethodFilter);
    const rolesRepo = manager.getRepository(Role);
    const userRolesRepo = manager.getRepository(UserRole);

    // load default roles
    for (const role of getDumpEntities('roles', DUMP_PATH_ROOT)) {
      await rolesRepo.save(rolesRepo.create(role));
    }

    // load default user roles
    for (const userRole of getDumpEntities('user-roles', DUMP_PATH_ROOT)) {
      await userRolesRepo.save(userRolesRepo.create(userRole));
    }

    // load default filters
    for (const filter of getDumpEntities('filters', DUMP_PATH_ROOT)) {
      await filtersRepo.save(filtersRepo.create(filter));
    }

    // load default conditions
    for (const condition of getDumpEntities('conditions', DUMP_PATH_ROOT)) {
      await conditionRepo.save(conditionRepo.create(condition));
    }

    // load default models
    for (const model of getDumpEntitiesInFiles(DUMP_PATH_MODELS)) {
      await modelRepo.save(modelRepo.create(model));
    }

    // load default methods
    for (const { modelIn, modelOut, methodFilters, condition, ...method } of getDumpEntitiesInFiles(
      DUMP_PATH_METHODS,
    )) {
      const methodEntity = methodRepo.create(method as Partial<Method>);

      // attach model in if exist
      if (modelIn) {
        methodEntity.modelInId = (await modelRepo.findOne({ alias: modelIn }))?.id ?? null;
      }

      // attach model out if exist
      if (modelOut) {
        methodEntity.modelOutId = (await modelRepo.findOne({ alias: modelOut }))?.id ?? null;
      }

      // attach condition if exist
      if (condition) {
        methodEntity.conditionId = (await conditionRepo.findOne({ title: condition }))?.id ?? null;
      }

      const methodModel = await methodRepo.save(methodRepo.create(methodEntity));

      // create default method filters
      if (methodFilters?.length > 0) {
        for (const { filterTitle, ...methodFilter } of methodFilters) {
          const methodFilterEntity = methodFilterRepo.create(methodFilter as Partial<MethodFilter>);
          const filterModel = await filtersRepo.findOne({ title: filterTitle });

          if (!filterModel) {
            console.info('WARNING: Failed to create method filter. Filter not found:', filterTitle);

            continue;
          }

          methodFilterEntity.methodId = methodModel.id;
          methodFilterEntity.filterId = filterModel.id;

          await methodFilterRepo.save(methodFilterEntity);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!MS_DEFAULT_PERMISSION_MIGRATION) {
      return;
    }

    await queryRunner.query(`DELETE FROM public.method_filter`);
    await queryRunner.query(`DELETE FROM public.method`);
    await queryRunner.query(`DELETE FROM public.filter`);
    await queryRunner.query(`DELETE FROM public.model`);
    await queryRunner.query(`DELETE FROM public.role`);
    await queryRunner.query(`DELETE FROM public.user_role`);
  }
}

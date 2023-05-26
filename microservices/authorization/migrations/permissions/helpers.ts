import fs from 'fs';
import _ from 'lodash';
import { createConnection, Repository } from 'typeorm';
import CONST from '@constants/index';
import Condition from '@entities/condition';
import Filter from '@entities/filter';
import Method from '@entities/method';
import MethodFilter from '@entities/method-filter';
import Model from '@entities/model';
import Role from '@entities/role';

const DUMP_PATH_ROOT = `${__dirname}/list`;
const DUMP_PATH_MODELS = `${DUMP_PATH_ROOT}/models`;
const DUMP_PATH_METHODS = `${DUMP_PATH_ROOT}/methods`;

/**
 * Get dump entities
 */
const getDumpEntities = (filename: string, pathname: string): any[] => {
  let dumpEntities = [];

  try {
    dumpEntities = JSON.parse(fs.readFileSync(`${pathname}/${filename}.json`).toString());
  } catch (e) {
    console.info(`${filename} dump not exist.`);
  }

  return dumpEntities;
};

/**
 * Get dump entities in files
 */
const getDumpEntitiesInFiles = (pathname: string): any[] => {
  const files = fs.readdirSync(pathname);

  return files.reduce((entities, filename) => {
    const msEntities: never[] = JSON.parse(fs.readFileSync(`${pathname}/${filename}`).toString());

    entities.push(...msEntities);

    return entities;
  }, []);
};

/**
 * Save entities dump
 */
const saveDump = (entities: any[], filename: string, pathname: string): void => {
  fs.writeFileSync(`${pathname}/${filename}.json`, `${JSON.stringify(entities, null, 2)}\n`);
};

/**
 * Import entity permissions from json file to DB
 */
const importEntityPermissions = async (
  repository: Repository<any>,
  filename: string | any[],
  onlyCleanup: boolean,
  updateBy?: string,
): Promise<void> => {
  if (!updateBy) {
    await repository.delete({});
  }

  if (onlyCleanup) {
    return;
  }

  const records: Record<string, any>[] =
    typeof filename === 'string' ? getDumpEntities(filename, DUMP_PATH_ROOT) : filename;

  for (const fields of records) {
    const updated = updateBy
      ? await repository.update({ [updateBy]: fields[updateBy] }, fields)
      : false;

    if (!updated || !updated.affected) {
      await repository.save(repository.create(fields as Record<string, any>));
    }
  }
};

/**
 * Import methods permissions from json file to DB
 */
const importMethodsPermissions = async (
  methodRepo: Repository<any>,
  methodFilterRepo: Repository<any>,
  modelRepo: Repository<any>,
  conditionRepo: Repository<any>,
  filtersRepo: Repository<any>,
  onlyCleanup: boolean,
) => {
  await methodFilterRepo.delete({});
  await methodRepo.delete({});

  if (onlyCleanup) {
    return;
  }

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

    const methodModel = await methodRepo.save(methodRepo.create(methodEntity as Partial<Method>));

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
};

/**
 * Get models records
 */
const getModelRecords = async (repo: Repository<any>) => {
  const records = getDumpEntitiesInFiles(DUMP_PATH_MODELS);
  const singleTypePredicate = { alias: 'content.SingleType' };
  const singleTypeRecord = _.find(records, { alias: singleTypePredicate });

  // keep original single type value schema object
  if (singleTypeRecord) {
    const dbSingleType = await repo.findOne(singleTypePredicate);

    _.set(singleTypeRecord, 'schema.value.object', dbSingleType?.schema?.value?.object ?? {});
  }

  return records;
};

/**
 * Import permissions from json files to DB
 */
const importPermissions = async (onlyCleanup = false) => {
  const connection = await createConnection();
  const isReImport = CONST.MS_IMPORT_PERMISSION === 2;

  await connection.transaction(async (manager) => {
    const methodRepo = manager.getRepository(Method);
    const modelRepo = manager.getRepository(Model);
    const conditionRepo = manager.getRepository(Condition);
    const filtersRepo = manager.getRepository(Filter);
    const methodFilterRepo = manager.getRepository(MethodFilter);
    const rolesRepo = manager.getRepository(Role);

    if (!isReImport && (await rolesRepo.find({ take: 1 })).length) {
      return;
    }

    const entities = [
      { repository: rolesRepo, file: 'roles', updateBy: 'alias' },
      { repository: filtersRepo, file: 'filters', updateBy: 'title' },
      { repository: conditionRepo, file: 'conditions', updateBy: 'title' },
      { repository: modelRepo, file: await getModelRecords(modelRepo), updateBy: 'alias' },
      () =>
        importMethodsPermissions(
          methodRepo,
          methodFilterRepo,
          modelRepo,
          conditionRepo,
          filtersRepo,
          onlyCleanup,
        ),
    ];

    if (onlyCleanup) {
      entities.reverse();
    }

    for (const data of entities) {
      if (typeof data === 'function') {
        await data();

        continue;
      }

      const { repository, file, updateBy } = data;

      await importEntityPermissions(repository, file, onlyCleanup, updateBy);
    }

    console.log('Permissions imported.');
  });

  await connection.close();
};

export {
  DUMP_PATH_ROOT,
  DUMP_PATH_MODELS,
  DUMP_PATH_METHODS,
  saveDump,
  getDumpEntities,
  getDumpEntitiesInFiles,
  importPermissions,
};

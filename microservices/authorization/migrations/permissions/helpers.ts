import fs from 'fs';

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
  fs.writeFileSync(`${pathname}/${filename}.json`, JSON.stringify(entities, null, 2));
};

export {
  DUMP_PATH_ROOT,
  DUMP_PATH_MODELS,
  DUMP_PATH_METHODS,
  saveDump,
  getDumpEntities,
  getDumpEntitiesInFiles,
};

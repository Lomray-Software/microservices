const fs = require('fs');
const fse = require('fs-extra');
const childProcess = require('child_process');

const [, , task, arg1, arg2] = process.argv;

console.info('Running task:', task);
console.info('Detected branch:', process.env.BRANCH || 'not found, use default: staging');

// environments
const only = process.env.ONLY || '';

// path's
const microservicesDir='microservices';
const dotenvFile = '.env';
const middlewaresFile = './configs/middlewares.json';
const configFile = './configs/config.local.json';

/**
 * Get microservices list
 */
const getMicroservices = (withDir, checkJson) => {
  const list = [];
  const dirs = fs.readdirSync(microservicesDir, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) {
      continue;
    }

    if (only !== '' && !only.includes(dir.name)) {
      continue;
    }

    if (checkJson && !fs.existsSync(`${microservicesDir}/${dir.name}/package.json`)) {
      continue;
    }

    const name = withDir ? `${microservicesDir}/${dir.name}` : dir.name;

    list.push(name);
  }

  console.log('Obtained microservices:', list);

  return list;
}

/**
 * Replace string in file
 */
const replaceStrInFile = (subj, replaceValue, file) => {
  const data = fs.readFileSync(file, { encoding: 'utf-8' }).replace(new RegExp(subj, 'g'), replaceValue);

  fs.writeFileSync(file, data, { encoding: 'utf-8' });
}

/**
 * Update .env file
 */
const runUpdateDotenv = () => {
  const middlewares = JSON.stringify(JSON.parse(fs.readFileSync(middlewaresFile, { encoding: 'utf8' })));
  const configs = JSON.stringify(JSON.parse(fs.readFileSync(configFile, { encoding: 'utf8' })));
  const dotenv = fs.readFileSync(dotenvFile, { encoding: 'utf8' })
    .replace(/MS_INIT_MIDDLEWARES=.*/, `MS_INIT_MIDDLEWARES='${middlewares}'`)
    .replace(/MS_INIT_CONFIGS=.*/, `MS_INIT_CONFIGS='${configs}'`);

  fs.writeFileSync(dotenvFile, dotenv, 'utf8');
}

/**
 * Install npm packages for each microservice
 */
const runGlobalInstall = (isCI = 'y') => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    const packageJson = `${msDir}/package.json`;

    if (!fs.existsSync(packageJson)) {
      console.info(`Skip install: ${msDir}`)

      continue;
    }

    childProcess.execSync(`cd ${msDir} && npm ${isCI === 'y' ? 'ci' : 'i'}`, { stdio: 'inherit' });

    console.info(`Install done: ${msDir}`)
  }
}

/**
 * Update npm package for each microservice
 */
const runGlobalUpdate = (packageName, version = null) => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    const packageJson = `${msDir}/package.json`;

    if (!fs.existsSync(packageJson) || !fs.readFileSync(packageJson).includes(packageName)) {
      console.info(`Skip update package: ${msDir}`)

      continue;
    }

    if (version) {
      replaceStrInFile(`"${packageName}": "\\^[\\d\\.]+"`, `"${packageName}": "^${version}"`, packageJson);
    }

    childProcess.execSync(`cd ${msDir} && npm update ${packageName}`, { stdio: 'inherit' });

    console.info(`Package updated for: ${msDir}`);
  }
}

/**
 * Run semantic release
 */
const runSemanticRelease = (isDryRun = false) => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    childProcess.execSync(`cd ${msDir} && npx semantic-release ${isDryRun ? '--dryRun' : ''}`, {
      stdio: 'inherit',
      env: { ...process.env }
    });

    console.info(`Semantic release done: ${msDir}`)
  }
}

/**
 * Run lint staged
 */
const runLintStaged = () => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    childProcess.execSync(`cd ${msDir} && npx lint-staged`, { stdio: 'inherit' });

    console.info(`Lint staged done: ${msDir}`)
  }
}

/**
 * Build each microservice
 */
const runBuild = () => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    childProcess.execSync(`cd ${msDir} && npm run build`, { stdio: 'inherit' });

    const packageJsonJs = `${msDir}/lib/package.json.js`;

    if (!fs.existsSync(packageJsonJs)) {
      fs.writeFileSync(packageJsonJs, 'Object.defineProperty(exports, \'__esModule\', { value: true });\nvar version = "1.0.0";\nexports.version = version;');
      console.info(`Create package.json js: ${packageJsonJs}`)
    }

    console.info(`Build done: ${msDir}`)
  }
}

/**
 * Run tests for each microservice
 */
const runTests = (withCoverage = false) => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    childProcess.execSync(`cd ${msDir} && ${withCoverage ? 'nyc' : ''} npm run test`, { stdio: 'inherit' });

    console.info(`Tests done: ${msDir}`)
  }
}

/**
 * Check typescript for each microservice
 */
const runCheckTypescript = () => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    childProcess.execSync(`cd ${msDir} && npm run ts:check`, { stdio: 'inherit' });

    console.info(`Typescript check done: ${msDir}`)
  }
}

/**
 * Run lint for each microservice
 */
const runLint = (action = 'check') => {
  const microservices = getMicroservices(true, true);

  for (const msDir of microservices) {
    childProcess.execSync(`cd ${msDir} && npm run lint:${action}`, { stdio: 'inherit' });

    console.info(`Lint check done: ${msDir}`)
  }
}

/**
 * Create new microservice
 */
const runCreateMicroservice = (name) => {
  if (!name) {
    console.log('Microservice name required!');

    return;
  }

  const msPath = `${microservicesDir}/${name}`;

  if (fs.existsSync(msPath)) {
    console.log(`Microservice "${name}" exist!`);

    return;
  }

  // copy files
  fse.copySync('template', msPath, { overwrite: false });


  replaceStrInFile('microservice-name', `microservice-${name}`, `${msPath}/package.json`);
  replaceStrInFile('microservice-name', `microservice-${name}`, `${msPath}/package-lock.json`);
  replaceStrInFile('microservice-name', `microservice-${name}`, `${msPath}/sonar-project.properties`);
  replaceStrInFile('microservice-name', name, `${msPath}/src/constants/index.ts`);
  replaceStrInFile('microservice-name', name, `${msPath}/README.md`);
  replaceStrInFile('microservice-name', name, `${msPath}/__tests__/index-test.ts`);
  replaceStrInFile('.eslintrc.js', '..\/.eslintrc.js', `${msPath}/.eslintrc.js`);

  console.info(`Microservice created: ${msPath}`)
}

switch (task) {
  case 'update-dotenv':
    runUpdateDotenv();
    break;

  case 'global-install':
    runGlobalInstall(arg1);
    break;

  case 'global-update':
    runGlobalUpdate(arg1, arg2);
    break;

  case 'semantic-release':
    runSemanticRelease(Boolean(arg1));
    break;

  case 'lint-staged':
    runLintStaged();
    break;

  case 'build':
    runBuild();
    break;

  case 'tests':
    runTests(Boolean(arg1));
    break;

  case 'ts-check':
    runCheckTypescript();
    break;

  case 'lint':
    runLint(arg1);
    break;

  case 'create-ms':
    runCreateMicroservice(arg1);
    break;

  default:
    console.error('Task is empty. Please provide task to execute.')
}

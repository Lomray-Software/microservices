const fs = require('fs');

const [, , task] = process.argv;

console.info('Running task:', task);

// path's
const dotenvFile = '.env';
const middlewaresFile = './configs/middlewares.json';
const configFile = './configs/config.local.json';

/**
 * Update .env file
 */
const updateDotenv = () => {
  const middlewares = JSON.stringify(JSON.parse(fs.readFileSync(middlewaresFile, 'utf8')));
  const configs = JSON.stringify(JSON.parse(fs.readFileSync(configFile, 'utf8')));
  const dotenv = fs.readFileSync(dotenvFile, 'utf8')
    .replace(/MS_INIT_MIDDLEWARES=.*/, `MS_INIT_MIDDLEWARES='${middlewares}'`)
    .replace(/MS_INIT_CONFIGS=.*/, `MS_INIT_CONFIGS='${configs}'`);

  fs.writeFileSync(dotenvFile, dotenv, 'utf8');
}

// @TODO move all operations from bash file to here
switch (task) {
  case 'update-dotenv':
    updateDotenv();
    break;

  default:
    console.error('Task is empty. Please provide task to execute.')
}

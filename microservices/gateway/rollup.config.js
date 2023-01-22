const rootConfig = require('@lomray/microservice-config/rollup.config');

module.exports = {
  ...rootConfig,
  external: [...rootConfig?.external ?? [], 'cors'],
}

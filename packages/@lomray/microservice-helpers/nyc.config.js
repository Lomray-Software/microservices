const rootConfig = require('../../../nyc.config');

module.exports = {
  ...rootConfig,
  exclude: [...rootConfig.exclude, 'src/mocks', 'src/test-helpers']
}

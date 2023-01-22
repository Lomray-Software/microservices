const copy = require('rollup-plugin-copy');
const rootConfig = require('@lomray/microservice-config/rollup.config');

module.exports = {
  ...rootConfig,
  input: [...rootConfig.input, 'migrations/permissions/*.ts'],
  external: [
    ...rootConfig.external,
    'fs',
  ],
  plugins: [
    ...rootConfig.plugins,
    copy({
      targets: [
        { src: 'migrations/permissions/list/**/*', dest: 'lib/migrations/permissions/list' },
      ]
    })
  ],
}

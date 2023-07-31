import copy from 'rollup-plugin-copy';

const rootConfig = (await import('@lomray/microservice-config/rollup.config.mjs')).default;

export default {
  ...rootConfig,
  input: [...rootConfig.input, 'migrations/permissions/*.ts'],
  external: [
    ...rootConfig.external,
    'fs',
    'child_process',
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

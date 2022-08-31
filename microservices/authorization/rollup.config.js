import copy from 'rollup-plugin-copy';
import rootConfig from '../../rollup.config';

const config = {
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

export default config;

import copy from 'rollup-plugin-copy';
import rootConfig from '../../rollup.config';

const config = {
  ...rootConfig,
  external: [
    ...rootConfig.external,
    'fs',
    '@lomray/microservices-types',
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

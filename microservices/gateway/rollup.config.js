import rootConfig from '../../rollup.config';

const config = rootConfig.map((baseConfig) => ({
  ...baseConfig,
  external: [...baseConfig?.external ?? [], 'cors'],
}));

export default config;

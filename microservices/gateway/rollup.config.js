import rootConfig from '../../rollup.config';

export default {
  ...rootConfig,
  external: ['cors'],
};

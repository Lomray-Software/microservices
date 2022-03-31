import typescript from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
  // build mocks for generate tslib with all helpers
  // separate mocks folder to prevent errors when use common import
  input: [
    'src/index.ts',
    'src/services/firebase-sdk.ts',
    'src/mocks/index.ts',
    'src/test-helpers/index.ts'
  ],
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  external: [
    'rewiremock',
    'sinon',
    'winston',
    'firebase-admin',
    'fs',
    'typeorm',
    'class-validator',
    'class-transformer',
    'typeorm-extension',
    '@lomray/microservice-nodejs-lib',
    '@lomray/microservice-remote-middleware',
    'class-validator-jsonschema',
    '@lomray/typeorm-json-query',
    'typeorm/query-builder/SelectQueryBuilder',
  ],
  plugins: [
    peerDepsExternal(),
    json(),
    typescript({
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
        importHelpers: true,
        plugins: [
          {
            "transform": "@zerollup/ts-transform-paths",
            "exclude": ["*"]
          }
        ]
      }),
    }),
  ],
};

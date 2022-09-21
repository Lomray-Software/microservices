import typescript from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { folderInput } from 'rollup-plugin-folder-input'
import replace from '@rollup/plugin-replace';

/**
 * This is root config for microservices
 * All microservices extends from this config
 */
const config = {
  input: ['src/**/*.ts', 'migrations/*.ts'],
  output: {
    dir: 'lib',
    format: 'cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  external: ['crypto', '@lomray/microservice-nodejs-lib', '@lomray/microservices-types', 'fs', '@lomray/microservice-remote-middleware'],
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.__IS_BUILD__': 'true',
      },
    }),
    folderInput(),
    peerDepsExternal({
      includeDependencies: true,
    }),
    json(),
    typescript({
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
        importHelpers: true,
        sourceMap: true,
        inlineSources: true,
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

export default config;

import typescript from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { folderInput } from 'rollup-plugin-folder-input'
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import cleaner from 'rollup-plugin-cleaner';

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
  external: ['crypto', 'fs', '@lomray/microservice-nodejs-lib', '@lomray/microservices-types', '@lomray/microservice-remote-middleware'],
  plugins: [
    cleaner({
      targets: ['./lib/'],
    }),
    replace({
      preventAssignment: true,
      values: {
        'process.env.__IS_BUILD__': 'true',
        'process.env.__BRANCH__': `'${process.env.BRANCH || 'staging'}'`,
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
    copy({
      targets: [
        { src: 'package.json', dest: 'lib' },
      ]
    }),
  ],
};

export default config;

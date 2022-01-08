import typescript from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import ttypescript from 'ttypescript'

/**
 * This is root config for microservices
 * 1. Microservice entrypoint
 * 2. Microservice library entrypoint
 * All microservices extends from this config
 */
const config = {
  plugins: [
    peerDepsExternal({
      includeDependencies: true,
    }),
    json(),
    typescript({
      typescript: ttypescript,
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
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

const libEntrypoint = {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  ...config,
};

const microserviceEntrypoint = {
  input: 'src/start.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  ...config,
};

export default [libEntrypoint, microserviceEntrypoint];

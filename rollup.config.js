import typescript from '@wessberg/rollup-plugin-ts';
import json from '@rollup/plugin-json';
import multi from '@rollup/plugin-multi-entry';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import ttypescript from 'ttypescript'

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
  input: [
    'src/index.ts',
    'src/exports.ts',
  ],
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  ...config,
  plugins: [multi(), ...config.plugins],
};

const microserviceEntrypoint = {
  input: 'src/start.ts',
  output: {
    file: 'lib/start.js',
    format: 'cjs'
  },
  ...config,
};

export default [libEntrypoint, microserviceEntrypoint];

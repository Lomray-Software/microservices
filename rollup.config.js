import typescript from '@wessberg/rollup-plugin-ts';
import json from '@rollup/plugin-json';
import ttypescript from 'ttypescript'

const config = {
  plugins: [
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
  external: ['@lomray/microservice-nodejs-lib', '@lomray/microservice-remote-middleware'],
};

const libEntrypoint = {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
  ...config,
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

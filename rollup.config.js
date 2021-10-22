import typescript from '@wessberg/rollup-plugin-ts';
import json from '@rollup/plugin-json';
import ttypescript from 'ttypescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
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
  external: ['@lomray/microservice-nodejs-lib'],
};

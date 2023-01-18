import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'

const devTasks = {
  input: 'src/index.ts',
  external: ['axios'],
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
  ],
  plugins: [
    nodeResolve(),
    typescript(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('development'),
      },
    }),
  ],
}

const prodTasks = {
  input: 'src/index.ts',
  external: ['axios'],
  output: [
    {
      file: 'dist/index.cjs.prod.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.esm.prod.js',
      format: 'es',
    },
  ],
  plugins: [
    nodeResolve(),
    typescript(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
    }),
    terser(),
  ],
}

export default [
  devTasks,
  prodTasks,
]

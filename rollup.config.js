import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default [
  {
    input: 'src/content-entry.js',
    output: {
      file: 'src/content.js',
      format: 'iife',
      globals: {
        jquery: '$'
      }
    },
    plugins: [
      resolve(),
    ]
  },
  {
    input: 'src/background-entry.js',
    output: {
      file: 'src/background.js',
      format: 'iife'
    },
    plugins: [
      resolve(),
    ]
  }
]


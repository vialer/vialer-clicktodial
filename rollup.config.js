import rootImport from 'rollup-plugin-root-import';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import {
  SCRIPT_MAIN_SOURCE_TO_DESTINATION,
  SCRIPT_SOURCES_TO_DESTINATIONS,
  SOURCE_DIR,
  DESTINATION_DIR
} from './constants.mjs';

const isProductionBuild = process.env.BUILD === 'production';

function getConfig(input, file) {
  return {
    input,
    output: {
      file,
      format: 'esm',
      sourcemap: true,
      watch: {
        clearScreen: false
      },
      paths: SCRIPT_SOURCES_TO_DESTINATIONS
    },
    external: Object.keys(SCRIPT_SOURCES_TO_DESTINATIONS),
    inlineDynamicImports: true,
    plugins: [
      nodeResolve(),
      commonjs(),
      replace({
        delimiters: ['%%', '%%'],
        values:
          process.env
      }),
      rootImport({
        root: `${__dirname}/src`,
        useEntry: 'prepend'
      }),
      isProductionBuild &&
      terser({
        ecma: 8,
        warnings: 'verbose',
        module: true
      })
    ],
    watch: {
      // this will be ignored if Rollup doesn't receive a -w CLI flag
      chokidar: true,
      clearScreen: false
    }
  };
}

function mapGetConfig([from, to]) {
  let source;
  if (from.startsWith('/')) {
    source = `${SOURCE_DIR}${from}`;
  } else {
    source = from;
  }

  return getConfig(source, `${DESTINATION_DIR}${to}`);
}

export default new Promise(function (resolve) {
  resolve(
    Object.entries(SCRIPT_MAIN_SOURCE_TO_DESTINATION)
      .map(mapGetConfig)
      .concat(Object.entries(SCRIPT_SOURCES_TO_DESTINATIONS).map(mapGetConfig))
  );
});


import { parse, sep } from 'path';
import minifier from 'html-minifier';
import replaceEnvVariables from './replaceEnvVariables.mjs';
import copyFile from './copyFile.mjs';
import readFile from './readFile.mjs';
import writeFile from './writeFile.mjs';
import makeDirectory from './makeDirectory.mjs';
import compileStyles from './compileStyles.mjs';
import {
  DESTINATION_DIR,
  DESTINATION_STYLE_SHEET,
  IGNORED_DIRS,
  SOURCE_DIR,
  SOURCE_STYLE_SHEET,
  STATIC_DIRS,
  STATIC_FILES
} from '../../constants.mjs';

const isProductionBuild = process.env.BUILD === 'production';

const htmlMinifyOptions = {
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeComments: true,
  useShortDoctype: true,
  sortAttributes: true,
  sortClassName: true,
  minifyCSS: isProductionBuild ? true : false,
  minifyJS: isProductionBuild ? true : false
};

let styleTimeOut;

const sourceDirRegExp = new RegExp(`${SOURCE_DIR}${sep}?`);
export default function processFile(source, sto) {
  const { dir, base, ext, name } = parse(source);
  const relativeDir = dir ? dir.replace(sourceDirRegExp, '') : '';
  const relativeSource = `${relativeDir ? `${relativeDir}${sep}` : ''}${base}`;
  const destinationDir = dir.replace(SOURCE_DIR, DESTINATION_DIR);

  if (IGNORED_DIRS.includes(relativeDir)) {
    sto && sto.succeed(`ignoring ${source}`);
    return;
  }

  const destination = `${destinationDir}${sep}${base}`;

  if (STATIC_DIRS.includes(relativeDir) || STATIC_FILES.includes(relativeSource)) {
    return makeDirectory(destinationDir)
      .then(() => {
        if (['.txt', '.html', '.json', '.mjs', '.js', '.webmanifest'].includes(ext)) {
          return readFile(source)
            .then(replaceEnvVariables)
            .then(content => writeFile(destination, content));
        } else {
          return copyFile(source, destination);
        }
      })
      .then(() => {
        sto && sto.succeed(`Copyied ${source} to ${destination}`);
      })
      .catch(console.error);
  }

  switch (ext) {
    case '.mjs':
      // handled by Rollup
      break;

    case '.html':
      return makeDirectory(destinationDir)
        .then(() => readFile(source))
        .then(replaceEnvVariables)
        .then(content => writeFile(destination, content))
        // .then(content => writeFile(destination, minifier.minify(content, htmlMinifyOptions)))
        .then(() => {
          sto && sto.succeed(`Copyied and minified ${source} to ${destination}`);
        })
        .catch(console.error);
      break;

    case '.postcss':
      if (styleTimeOut) {
        clearTimeout(styleTimeOut);
      }
      styleTimeOut = setTimeout(() => {
        compileStyles({ input: SOURCE_STYLE_SHEET, output: DESTINATION_STYLE_SHEET }).then(() => {
          sto && sto.succeed('Compiled styles');
        });
      }, 100);
  }
}

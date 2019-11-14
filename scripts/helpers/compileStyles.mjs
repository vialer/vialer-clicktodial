import { basename } from 'path';
import postcss from 'postcss';
import cssnano from 'cssnano';
import cssImport from 'postcss-import';
import postcssNestedAncestors from 'postcss-nested-ancestors';
import postcssNested from 'postcss-nested';
import autoprefixer from 'autoprefixer';
import readFile from './readFile.mjs';
import writeFile from './writeFile.mjs';

const plugins = [
  cssImport({
    path: ['src/styles']
  }),
  postcssNestedAncestors,
  postcssNested,
  autoprefixer
];
if (process.env.BUILD === 'production') {
  plugins.push(cssnano);
}
const processor = postcss(plugins);


export default function compileStyles({ input, output }) {
  const outputFileName = basename(output);
  const inputFileName = basename(input);

  return readFile(input).then(contents => {
    return processor
      .process(contents, {
        from: inputFileName,
        to: outputFileName,
        map: { inline: false }
      })
      .then(async ({ map, css }) => {
        await writeFile(output, css);
        if (map) {
          await writeFile(`${output}.map`, map);
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
}

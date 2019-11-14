import { basename, join, dirname } from 'path';
import ora from 'ora';
import readDirectory from './readDirectory.mjs';
import makeDirectory from './makeDirectory.mjs';
import copyFile from './copyFile.mjs';

import { STATIC_FILES, STATIC_DIRS } from '../constants.mjs';

export default async function() {
  const o = ora('Started to copy static files').start();

  o.text = 'Copying directories';
  await Promise.all(
    Object.entries(STATIC_DIRS).map(([src, dest]) =>
      readDirectory(src).then(({ files }) =>
        makeDirectory(dest).then(() =>
          files.map(file => copyFile(file, join(dest, basename(file))))
        )
      )
    )
  ).catch(e => {
    console.log(e);
  });
  o.succeed('Copied directories');

  o.text = 'Copying files';
  await Promise.all(
    Object.entries(STATIC_FILES).map(([src, dest]) =>
      makeDirectory(dirname(dest)).then(() => copyFile(src, dest))
    )
  );
  o.succeed('Copied files');
}

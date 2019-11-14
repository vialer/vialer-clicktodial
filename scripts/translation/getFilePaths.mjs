import { join, extname, basename } from 'path';
import { LOCATION, TRANSLATION_FILE_TYPE, ROOT_DIR } from './constants.mjs';
import readDirectory from '../helpers/readDirectory.mjs';
import getLocales from './getLocales.mjs';

let cache;
/*
Used to return a collection of objects containing infromation about static files used to enable
translations (and language switching) in the front end
*/
export default function() {
  if (cache) {
    return Promise.resolve(cache);
  }

  return cache = new Promise(async function(resolve, reject) {
    const files = [];

    try {
      const locales = await getLocales();

      await Promise.all(
        locales.map(async function(locale) {
          const translationFiles = await readDirectory(join(LOCATION, locale))
            .then(({ files }) => files)
            .then(files => files.filter(file => extname(file) === `.${TRANSLATION_FILE_TYPE}`));

          translationFiles.forEach(path => {
            files.push({
              locale,
              path,
              relativePath: path.replace(ROOT_DIR, ''),
              file: basename(path).replace(extname(path), ''),
              extension: extname(path)
            });
          });
        })
      );

      resolve(files);
    } catch (err) {
      reject(err);
    }
  });
}

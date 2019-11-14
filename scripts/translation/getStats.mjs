import globby from 'globby';
import readFile from '../helpers/readFile.mjs';
import getKeys from './getKeys.mjs';
import { KEY_GLOBS, ROOT_DIR } from './constants.mjs';
import getDynamicKeys from './getDynamicKeys.mjs';
import makeLists from './makeLists.mjs';

let cache;

/*
Used to get an object with relevant information about translations
Currently it outputs:
 - all the translation keys found in the front end code
 - in what files all keys are found, grouped by file
 - what keys are found in what files grouped by key
*/
export default function getTranslationStats() {
  if (cache) {
    return Promise.resolve(cache);
  }

  return (cache = new Promise(async (resolve, reject) => {
    const byPathUnsorted = {};
    const byKey = {};
    const allKeys = {};

    try {
      // to support indirect translations or translation keys that logically can not be found in
      // front end files we also check and see if there's a file with dynamic keys
      {
        const dynamicKeys = await getDynamicKeys();

        byPathUnsorted.dynamic = dynamicKeys;

        dynamicKeys.forEach(dynamicKey => {
          allKeys[dynamicKey] = undefined;
          byKey[dynamicKey] = {
            dynamic: undefined
          };
        });
      }

      const paths = await globby(KEY_GLOBS);

      await Promise.all(
        paths.map(async path => {
          const cleanedPath = path.replace(ROOT_DIR, '');

          let content;
          try {
            content = await readFile(path);
          } catch (err) {
            content = '';
          }

          const keys = getKeys(content);
          if (keys.length) {
            byPathUnsorted[cleanedPath] = keys;
          }

          keys.forEach(key => {
            allKeys[key] = undefined;

            if (!(key in byKey)) {
              byKey[key] = {};
            }
            byKey[key][cleanedPath] = undefined;
          });
        })
      );

      const byPath = Object.keys(byPathUnsorted)
        .sort()
        .reduce((ob, key) => {
          ob[key] = byPathUnsorted[key];
          return ob;
        }, {});

      resolve({
        keys: Object.keys(allKeys).sort(),
        byKey: makeLists(byKey),
        byPath
      });
    } catch (err) {
      reject(err);
    }
  }));
}

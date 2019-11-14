import readFile from '../helpers/readFile.mjs';
import getFilePaths from './getFilePaths.mjs';
import getLocales from './getLocales.mjs';
import getAllFlattenedProperties from './getAllFlattenedProperties.mjs';

let cache;

function checkMatchingKeys(ob) {
  const keys = Object.keys(ob);
  const missing = [];

  keys.forEach(key => {
    Object.keys(ob[key]).forEach(property => {
      keys.forEach(_key => {
        if (_key !== key && !(property in ob[_key])) {
          missing.push({
            property,
            where: _key
          });
        }
      });
    });
  });

  return missing;
}

export default async function getFilesAndKeys() {
  if (cache) {
    return Promise.resolve(cache);
  }

  return cache = new Promise(async (resolve, reject) => {
    try {
      const _properties = {};
      const _files = {};
      let allProperties = {};
      let allFiles = {};
      const locales = await getLocales();
      const filePaths = await getFilePaths();

      locales.forEach(locale => {
        _properties[locale] = {};
        _files[locale] = [];
      });

      await Promise.all(
        filePaths.map(({ file, locale, path }) => {
          return readFile(path)
            .then(JSON.parse)
            .then(content => ({
              locale,
              file,
              properties: getAllFlattenedProperties(content)
            }));
        })
      ).then(sorted => {
        // to not have to constantly de-duplicate what properties we find
        // we assign them to an object with the value of undefined (the value is not importand)
        // and later we use Object.keys to get the values in an array
        sorted.forEach(({ file, locale, properties }) => {
          _files[locale][file] = undefined;
          allFiles[file] = undefined;

          Object.keys(properties).forEach(property => {
            _properties[locale][`${file}.${property}`] = undefined;
            allProperties[property] = undefined;
          });
        });
      });

      allProperties = Object.keys(allProperties).sort();
      allFiles = Object.keys(allFiles).sort();

      const missingFiles = checkMatchingKeys(_files);
      const missingKeys = checkMatchingKeys(_properties);

      resolve({
        keys: allProperties,
        files: allFiles,
        missingKeys,
        missingFiles
      });
    } catch (err) {
      reject(err);
    }
  });
}

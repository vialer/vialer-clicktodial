import { join } from 'path';
import { promisify } from 'util';
import csvStringify from 'csv-stringify';
import { EXPORT_FILE_TYPE, LOCATION, ROOT_DIR } from './constants.mjs';
import getFilePaths from './getFilePaths.mjs';
import getLocales from './getLocales.mjs';
import writeFile from '../helpers/writeFile.mjs';
import readFile from '../helpers/readFile.mjs';

const stringify = promisify(csvStringify);
const outputFilename = `export.${EXPORT_FILE_TYPE}`;

const endCharRegexp = /[.?]$/;
function doAllItemsEndWithTheSameTypeOfCharacter(items) {
  const length = items.length;
  const checked = items.map(item => endCharRegexp.test(item));
  for (let i = 0; i < length; i++) {
    if (i !== 0 && checked[i - 1] !== checked[i]) {
      return false;
    }
  }
  return true;
}

/*
Used to create an export with all the locales, keys and data to an CSV file so people can easilly
share, edit and discuss translations
*/
export default function exportToFile() {
  return new Promise(async (resolve, reject) => {
    try {
      const allPropertyNamesObject = {};
      const locales = await getLocales();
      const filePaths = await getFilePaths();

      const columns = ['file', 'property'];
      locales.sort().forEach(l => {
        columns.push(l);
      });
      columns.push('remark');
      const rows = [];

      await Promise.all(
        filePaths.map(({ file, locale, path }) => {
          return readFile(path)
            .then(JSON.parse)
            .then(content => ({
              locale,
              file,
              content
            }));
        })
      ).then(collection => {
        collection.forEach(({ locale, file, content }) => {
          Object.keys(content).forEach(key => {
            const identifier = `${file}.${key}`;
            if (!(identifier in allPropertyNamesObject)) {
              allPropertyNamesObject[identifier] = {
                file,
                property: key
              };
            }

            allPropertyNamesObject[identifier][locale] = content[key];
          });
        });
      });

      Object.keys(allPropertyNamesObject)
        .sort()
        .forEach(identifier => {
          const row = allPropertyNamesObject[identifier];
          const content = locales.reduce((ar, locale) => {
            ar.push(row[locale]);
            return ar;
          }, []);

          if (!doAllItemsEndWithTheSameTypeOfCharacter(content)) {
            row.remark = '<-- inconsistency found';
          }
          rows.push(row);
        });

      stringify(rows, {
        columns,
        header: true,
        encoding: 'utf8'
      })
        .then(output => {
          const outputPath = join(LOCATION, outputFilename);
          return writeFile(outputPath, output).then(() => outputPath.replace(ROOT_DIR, ''));
        })
        .then(outputPath => {
          resolve(outputPath);
        });
    } catch (err) {
      reject(err);
    }
  });
}

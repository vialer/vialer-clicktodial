import { join } from "path";
import writeFile from "./helpers/writeFile.mjs";
import importFromFile from "./translation/importFromFile.mjs";
import getLocales from "./translation/getLocales.mjs";
import {
  LOCATION,
  TRANSLATION_FILE_TYPE,
  ROOT_DIR
} from "./translation/constants.mjs";

(async () => {
  try {
    const locales = await getLocales();
    const translations = await importFromFile();

    const data = {};
    locales.forEach(l => {
      data[l] = {};
    });

    translations
      .sort((a, b) => a.property - b.property)
      .forEach(line => {
        locales.forEach(l => {
          if (!(line.file in data[l])) {
            data[l][line.file] = {};
          }
          data[l][line.file][line.property] = line[l];
        });
      });

    const filesWritten = await Promise.all(
      locales.map(lang => {
        const files = Object.keys(data[lang]);

        return Promise.all(
          files.map(file => {
            const fileName = join(
              LOCATION,
              lang,
              `${file}.${TRANSLATION_FILE_TYPE}`
            );
            return writeFile(
              fileName,
              `${JSON.stringify(data[lang][file], null, "  ")}\n`
            ).then(() => fileName.replace(ROOT_DIR, ""));
          })
        );
      })
    );

    console.log("language files imported and written to:");
    filesWritten.forEach(file => {
      console.log(`-  ${file}`);
    });
  } catch (err) {
    console.error(err);
  }
})();

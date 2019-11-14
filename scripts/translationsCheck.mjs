import { join } from 'path';
import writeFile from './helpers/writeFile.mjs';
import { LOCATION, ROOT_DIR } from './translation/constants.mjs';
import getStats from './translation/getStats.mjs';
import getProblems from './translation/getProblems.mjs';

(async () => {
  const statsPath = join(LOCATION, 'stats.json');
  const stats = await getStats();
  writeFile(statsPath, JSON.stringify(stats, null, '  '));
  console.log(`Language stats written to ${statsPath.replace(ROOT_DIR,'')}`);

  const { missingKeys, missingFiles, missingTranslations, unusedTranslations } = await getProblems();

  missingFiles.forEach(({property, where}) => {
    console.log(`Missing file ${property} in locale ${where}`);
  });
  missingKeys.forEach(({property, where}) => {
    console.log(`Missing key ${property} in file ${where}`);
  });
  missingTranslations.forEach(missingTranslation => {
    console.log(`Missing translation ${missingTranslation}`);
  });
  unusedTranslations.forEach(unusedTranslation => {
    console.log(`Unused translation key ${unusedTranslation}`);
  });

  console.log('Checks done.');
})();

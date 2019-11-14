import getStats from './getStats.mjs';
import getFilesAndKeys from './getFilesAndKeys.mjs';

export default function() {
  return new Promise(async (resolve, reject) => {
    try {
      const [{ keys, missingKeys, missingFiles }, stats] = await Promise.all([
        getFilesAndKeys(),
        getStats()
      ]);
      const missingTranslations = [];
      const unusedTranslations = [];

      stats.keys.forEach(key => {
        if (!keys.includes(key)) {
          missingTranslations.push(key);
        }
      });

      keys.forEach(key => {
        if (!stats.keys.includes(key)) {
          unusedTranslations.push(key);
        }
      });

      resolve({
        missingFiles,
        missingKeys,
        missingTranslations,
        unusedTranslations
      });
    } catch (err) {
      reject(err);
    }
  });
}

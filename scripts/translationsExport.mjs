import exportToFile from './translation/exportToFile.mjs';

(async () => {
  const exportedFile = await exportToFile();
  console.log(`Translations successfully exported to ${exportedFile}`);
})();

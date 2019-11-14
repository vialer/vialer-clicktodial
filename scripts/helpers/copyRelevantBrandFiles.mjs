import ora from 'ora';
import { resolve, basename, join } from 'path';
import process from 'process';
import readDirectory from './readDirectory.mjs';
import makeDirectory from './makeDirectory.mjs';
import copyFile from './copyFile.mjs';

const replace = (() => {
  const removeThis = new RegExp(process.cwd());
  return path => path.replace(removeThis, '');
})();

const brandsDirectory = resolve('brands');
const brandDestination = resolve('src', 'brand');

export default async function() {
  const o = ora('Started to copy relevant brand files').start();

  let foundBrand;
  const { BRAND } = process.env;

  o.succeed('Checked BRAND value');
  if (!BRAND) {
    o.info('no BRAND found in .env, defaulting to \'default\'');
    foundBrand = 'default';
  }

  if ('default' !== foundBrand) {
    o.info(`'${BRAND}' brand found in env`);
    foundBrand = BRAND;
  }

  o.text = 'Checking brand files';
  const sourceDirectory = join(brandsDirectory, foundBrand);
  let filesInDir;
  try {
    filesInDir = await readDirectory(sourceDirectory).then(({ files }) =>
      files.map(f => basename(f))
    );
  } catch (e) {
    o.fail(
      `Directory ${sourceDirectory} not found, aborting copying brand files for ${foundBrand}`
    );
  }

  o.succeed(`Brand files found:
${filesInDir.map(replace).join('\n')}`);

  o.text = `Started copying static files for ${BRAND}`;
  try {
    await makeDirectory(brandDestination).then(() =>
      Promise.all(
        filesInDir.map(file => copyFile(join(sourceDirectory, file), join(brandDestination, file)))
      )
    );

    o.succeed(`Finished copying static brand files for '${foundBrand}'`);
  } catch (e) {
    o.fail(`Error during copying static brand files for '${foundBrand}'`);
    console.error(e);
  }
}

import ora from 'ora';
import { join } from 'path';
import { existsSync } from 'fs';
import { DESTINATION_DIR } from '../../constants.mjs';
import computePreCacheManifest from './computePreCacheManifest.mjs';
import readFile from './readFile.mjs';
import writeFile from './writeFile.mjs';

export default async function injectPreCacheManifest() {
  const o = ora('Injecting precache manifest into service worker').start();
  const swFile = join(DESTINATION_DIR, 'service_worker.js');
  if (!existsSync(swFile)) {
    o.fail(`Service worker not found at ${swFile}`);
    return;
  }

  o.succeed(`Found service worker at ${swFile}`);

  const precacheManifest = await computePreCacheManifest();
  o.succeed(`Computed precache manifest of ${precacheManifest.length} files`);

  const contents = await readFile(swFile);
  const newContents = contents.replace(
    'workbox.precaching.precacheAndRoute([]);',
    `workbox.precaching.precacheAndRoute(${JSON.stringify(precacheManifest, null, 2)});`
  );

  if (contents === newContents) {
    o.fail(`Service worker ${swFile} does not contain an empty precaching directive!`);
  } else {
    await writeFile(swFile, newContents);
    o.succeed('Injected precache manifest into service worker');
  }
}

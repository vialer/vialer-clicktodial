import ora from 'ora';
import chokidar from 'chokidar';
import clearDist from './helpers/clearDist.mjs';
import makeDirectory from './helpers/makeDirectory.mjs';
import processFile from './helpers/processFile.mjs';
import copyRelevantBrandFiles from './helpers/copyRelevantBrandFiles.mjs';
import spawnProcess from './helpers/spawnProcess.mjs';
import {
  SOURCE_DIR,
  DESTINATION_DIR,
} from '../constants.mjs';

export default async function build({first}) {
  try {
    const o = ora('Starting build').start();


    o.text = `Clearing ${DESTINATION_DIR}`;
    await clearDist();
    o.succeed(`Cleared ${DESTINATION_DIR}`);


    o.text = `Creating ${DESTINATION_DIR}`;
    await makeDirectory(DESTINATION_DIR);
    o.succeed(`Created ${DESTINATION_DIR}`);


    if (first) {
      o.text = `Copying relevant brand files`;
      await copyRelevantBrandFiles();
      o.succeed(`Copied relevant brand files`);
    }

    const watcher = chokidar.watch(SOURCE_DIR, {
      persistent: false
    });

    watcher.on('add', filePath => {
      try {
        processFile(filePath);
      } catch (e) {
        console.error(e);
      }
    });

    o.succeed('Starting Rollup build');
    await spawnProcess('rollup', '-c');
    console.log();
    o.succeed('Finished Rollup build');

  } catch (e) {
    console.error(e);
  }
}

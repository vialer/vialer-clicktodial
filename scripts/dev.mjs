import ora from 'ora';
import chokidar from 'chokidar';
import processFile from './helpers/processFile.mjs';
import clearDist from './helpers/clearDist.mjs';
import childProcesses from './helpers/childProcesses.mjs';
import makeDirectory from './helpers/makeDirectory.mjs';
import copyRelevantBrandFiles from './helpers/copyRelevantBrandFiles.mjs';
import { SOURCE_DIR, DESTINATION_DIR } from '../constants.mjs';

(async () => {
  try {
    const o = ora('Starting dev').start();
    o.text = `Clearing ${DESTINATION_DIR}`;
    await clearDist();
    o.succeed(`Cleared ${DESTINATION_DIR}`);


    o.text = `Creating ${DESTINATION_DIR}`;
    await makeDirectory(DESTINATION_DIR);
    o.succeed(`Created ${DESTINATION_DIR}`);


    o.text = `Copying relevant brand files`;
    await copyRelevantBrandFiles();
    o.succeed(`Copied relevant brand files`);

    const watcher = chokidar.watch(SOURCE_DIR);

    watcher.on('add', filePath => {
      try {
        processFile(filePath);
      } catch (e) {
        console.error(e);
      }
    });

    watcher.on('change', filePath => {
      try {
        processFile(filePath, o);
      } catch (e) {
        console.error(e);
      }
    });

    o.text = 'Starting all watchers';
  } catch (e) {
    console.error(e);
  }

  childProcesses(
    `rollup -c -w`
  );
})();

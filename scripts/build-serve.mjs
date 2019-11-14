import ora from 'ora';
import chokidar from 'chokidar';
import { SOURCE_DIR } from '../constants.mjs';
import childProcesses from './helpers/childProcesses.mjs';
import debounce from './helpers/debounce.mjs';
import build from './build-base.mjs';

(async () => {
  const watcher = chokidar.watch(SOURCE_DIR);

  let building;
  let rebuildScheduled = false;
  const rebuild = () => {
    if (building) {
      rebuildScheduled = true;
    } else {
      building = build({first: false})
        .then(() => ora('Rebuild done').succeed())
        .catch(console.error)
        .finally(() => {
          building = undefined;
          if (rebuildScheduled) {
            rebuildScheduled = false;
            rebuild();
          }
        });
    }
  };

  const debouncedRebuild = debounce(rebuild, 1000);

  watcher.on('change', filePath => {
    ora(`File changed: ${filePath}`).info();
    try {
      debouncedRebuild();
    } catch (e) {
      console.error(e);
    }
  });

  await build({first: true});

  childProcesses(
    `serve -l 5001 ./dist`,
    'node --experimental-modules --no-warnings ./scripts/proxy.mjs'
  );

})();

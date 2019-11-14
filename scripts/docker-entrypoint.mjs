import childProcesses from './helpers/childProcesses.mjs';
import build from './build-base.mjs';

(async () => {
  await build({first: true});

  childProcesses(
    `serve -l 5001 ./dist`,
    'node --experimental-modules --no-warnings ./scripts/proxy.mjs'
  );
})();

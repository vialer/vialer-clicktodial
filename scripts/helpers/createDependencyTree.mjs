import acorn from 'acorn';
import { SCRIPT_SOURCES_TO_DESTINATIONS } from '../../constants.mjs';
import readFile from './readFile.mjs';
import writeFile from './writeFile.mjs';

const modules = {};
const externalSources = Object.keys(SCRIPT_SOURCES_TO_DESTINATIONS);
const externalDestinations = Object.values(SCRIPT_SOURCES_TO_DESTINATIONS);

const overrides = ['p-retry'];

function getImports(specifier) {

  if (specifier in modules || externalSources.includes(specifier) || externalDestinations.includes(specifier) || overrides.includes(specifier)) {
    return Promise.resolve();
  }

  return new Promise(async (resolve, reject) => {
    const path = `./src/${specifier}`;
    const content = await readFile(path);
    const { body }  = acorn.parse(content, {
      ecmaVersion: 10,
      sourceType: 'module'
    });

    const foundImports = {};

    body.forEach(node => {
      const { type, specifiers, source } = node;
      if ( type === 'ImportDeclaration') {
        foundImports[source.value] = undefined;
      }
    });

    modules[specifier] = foundImports;

    resolve(
      Promise.all(
        Object.keys(foundImports).map(foundImport => getImports(foundImport)
      ))
    );
  }
  );
}



(async () => {
  await getImports('index.mjs');

  const added = {};
  const deps = {};

  function addDep (ob, specifier) {
    ob[specifier] = {};

    if (!modules[specifier]) {
      return;
    }
    Object.keys(modules[specifier]).forEach(_specifier => {
      ob[specifier][_specifier] = {};

      if (_specifier in added) {
        ob[specifier][_specifier] = '-->';
        return;
      }

      added[_specifier] = null;

      addDep(ob[specifier], _specifier);
    });
  };

  addDep(deps, 'index.mjs');
  writeFile('./dependencyTree.json',JSON.stringify(deps, null,'  '));
})()

import { relative, join } from 'path';
import { DESTINATION_DIR, PRECACHE_IGNORE_PREFIXES } from '../../constants.mjs';
import readDirectory from './readDirectory.mjs';
import fileHash from './fileHash.mjs';

async function getAssets(path) {
  const { directories, files } = await readDirectory(path);
  return Array.prototype.concat.apply(
    files.map(f => relative(DESTINATION_DIR, f)),
    await Promise.all(directories.map(getAssets))
  );
}

function objectFromEntries(entries) {
  return entries.reduce(
    (obj, [key, value]) => Object.assign(obj, { [key]: value }),
    {}
  );
}

function zip(a, b) {
  return a.map((e, i) => [e, b[i]]);
}

export default async function computePreCacheManifest() {
  const files = (await getAssets(DESTINATION_DIR)).filter(filename =>
    PRECACHE_IGNORE_PREFIXES.every(p => !filename.startsWith(p))
  );

  const hashes = await Promise.all(
    files.map(filename => fileHash(join(DESTINATION_DIR, filename), 'sha256'))
  );

  return zip(files, hashes).map(([filename, hash]) => {
    return { url: filename, revision: hash };
  });
}

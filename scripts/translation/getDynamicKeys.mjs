import { join } from 'path';
import { LOCATION } from './constants.mjs';
import readFile from '../helpers/readFile.mjs';

let cache;

export default function getDynamicKeys() {
  if (cache) {
    return Promise.resolve(cache);
  }

  return cache = new Promise(async (resolve, reject) => {
    try {
      const keys = await readFile(join(LOCATION, 'dynamic-keys.json'))
        .then(JSON.parse)
        .catch(() => ([]));

      resolve(keys.sort())
    } catch (err) {
      reject(err);
    }
  })
}

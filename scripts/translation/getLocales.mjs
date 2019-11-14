import { basename } from 'path';
import { LOCATION } from './constants.mjs';
import readDirectory from '../helpers/readDirectory.mjs';

let cache;

export default function() {
  if (cache) {
    return Promise.resolve(cache);
  }

  return cache =  new Promise((resolve, reject) => {
    readDirectory(LOCATION)
      .then(({ directories }) => directories.map(dir => basename(dir)))
      .then(languages => {
        resolve(languages);
      })
      .catch(err => {
        reject(err);
      });
  });
}

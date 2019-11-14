import rimraf from 'rimraf';
import { DESTINATION_DIR } from '../../constants.mjs';

export default async function clearDist() {
  return new Promise((resolve, reject) => {
    rimraf(DESTINATION_DIR, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

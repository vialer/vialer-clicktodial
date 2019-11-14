import { KEY_REGEXP } from './constants.mjs';

export default function (content) {
  const keys = {};

  let found;
  while ((found = KEY_REGEXP.exec(content)) !== null) {
    const [, key] = found;
    keys[key] = undefined;
  }

  return Object.keys(keys).sort();
}

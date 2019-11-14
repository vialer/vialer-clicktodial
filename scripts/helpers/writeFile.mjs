import { writeFile as wf } from 'fs';
import { promisify } from 'util';

const r = promisify(wf);

export default function writeFile(path, content) {
  return r(path, content, {
    encoding: 'utf8',
    flag: 'w'
  });
}

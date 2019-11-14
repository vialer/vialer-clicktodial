import {readFile as rf } from 'fs';
import { promisify } from 'util';

const r = promisify(rf);

export default function readFile(path) {
  return r(path, {
    encoding: 'utf8'
  });
}

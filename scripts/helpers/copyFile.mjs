import { copyFile as cf } from 'fs';
import { promisify } from 'util';

const c = promisify(cf);

export default function copyFile(from, to) {
  return c(from, to);
}

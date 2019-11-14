// the recursive option was added in node 10.12.0
// in earlier versions of node this option is ignored and will throw a ENOENT error for non existing paths...
import { mkdir } from 'fs';
import { promisify } from 'util';

const md = promisify(mkdir);

export default function makeDirectory(path) {
  return md(path, { recursive: true });
}

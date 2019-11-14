import { readdir } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const r = promisify(readdir);

export default function readDirectory(path) {
  return r(path, {
    encoding: 'utf8',
    withFileTypes: true
  }).then(dirents => {
    const files = [];
    const directories = [];
    const fileNames = [];

    dirents.forEach(dirent => {
      if (dirent.isDirectory()) {
        directories.push(join(path, dirent.name));
      }
      if (dirent.isFile()) {
        fileNames.push(dirent.name);
        files.push(join(path, dirent.name));
      }
    });

    return { directories, files, fileNames };
  });
}

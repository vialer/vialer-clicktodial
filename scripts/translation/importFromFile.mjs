import csvParse from 'csv-parse';
import { join } from 'path';
import { promisify } from 'util';
import readFile from '../helpers/readFile.mjs';
import { IMPORT_FILE_TYPE, LOCATION } from './constants.mjs';

const parse = promisify(csvParse);
const importFilename = `import.${IMPORT_FILE_TYPE}`;
const parseOptions = { relax: true, columns: true, relax_column_count: true };

export default function() {
  return readFile(join(LOCATION, importFilename)).then(content => parse(content, parseOptions));
}

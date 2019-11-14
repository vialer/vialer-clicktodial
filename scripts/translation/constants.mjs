import { resolve } from 'path';
import { SOURCE_DIR } from '../../constants.mjs';

export const CWD = process.cwd();
export const ROOT_DIR = `${CWD}/`;
export const TRANSLATION_FILE_TYPE = 'json';
export const EXPORT_FILE_TYPE = 'csv';
export const IMPORT_FILE_TYPE = 'csv';
export const LOCATION = resolve(SOURCE_DIR, 'locales');
export const KEY_GLOBS = [
  resolve(CWD, SOURCE_DIR, 'components', '**/*.mjs'),
  resolve(CWD, SOURCE_DIR, 'pages', '**/*.mjs')
];
export const KEY_REGEXP = /translation-key=['`"](.*?)['`"]/gm;

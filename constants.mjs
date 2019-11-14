import { join } from 'path';

export const DEFAULT_DOCUMENT = 'index.html';

export const SOURCE_DIR = 'src';
export const DESTINATION_DIR = 'dist';
export const SOURCE_STYLE_SHEET = join(SOURCE_DIR, 'styles', 'styles.postcss');
export const DESTINATION_STYLE_SHEET = join(DESTINATION_DIR, 'styles.css');

export const STATIC_FILES = ['manifest.json', 'index.js'];

export const IGNORED_DIRS = ['locales', 'utils'];

export const STATIC_DIRS = [
  join('locales', 'en-US'),
  join('locales', 'nl-NL'),
  join('vendor', 'workbox'),
  'brand',
  'fonts',
  'icons'
];

// export const PRECACHE_IGNORE_PREFIXES = ['_redirects', 'vendor/', 'service_worker.js', 'manifest.webmanifest'];

export const EXTERNAL_MODULE_DIRS = ['utils', 'lib', 'components'];

export const SCRIPT_MAIN_SOURCE_TO_DESTINATION = {
  '/popup.js': '/popup.js',
  '/content.js': '/content.js',
  '/background.js': '/background.js'
};

export const SCRIPT_SOURCES_TO_DESTINATIONS = {

};

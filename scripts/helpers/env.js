const { join } = require('path');
const loadEnv = require('parcel-bundler/src/utils/env.js');

const path = require.resolve(join(__dirname, '..', '..', 'src', 'index.html'));
module.exports = function() {
  return loadEnv(path);
};

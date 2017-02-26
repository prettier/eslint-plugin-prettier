'use strict';

const fs = require('fs');
const path = require('path');
const PACKAGE_NAME = require('./package').name;
const SYMLINK_LOCATION = path.join(__dirname, 'node_modules', PACKAGE_NAME);

// Symlink node_modules/{package name} to this directory so that ESLint resolves this plugin name correctly.
if (!fs.existsSync(SYMLINK_LOCATION)) {
  fs.symlinkSync(__dirname, SYMLINK_LOCATION);
}

module.exports = {
  plugins: ['node', 'eslint-plugin', PACKAGE_NAME],
  extends: [
    'not-an-aardvark/node',
    'plugin:node/recommended',
    'plugin:eslint-plugin/recommended',
    'prettier'
  ],
  root: true,
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'eslint-plugin/report-message-format': ['error', '^[^a-z].*\\.$']
  }
};

'use strict';

// Register ourselves as a plugin to avoid `node_modules` trickery.
const Plugins = require('eslint/lib/config/plugins');
Plugins.define('prettier', require('.'));

module.exports = {
  plugins: ['node', 'eslint-plugin', 'prettier'],
  extends: [
    'not-an-aardvark/node',
    'plugin:node/recommended',
    'plugin:eslint-plugin/recommended',
    'prettier'
  ],
  env: { mocha: true },
  root: true,
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'eslint-plugin/report-message-format': ['error', '^[^a-z].*\\.$']
  }
};

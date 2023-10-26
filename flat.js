// @ts-check
'use strict';

/**
 * @typedef {import('eslint').ESLint.Plugin} Plugin
 */

const prettier = require('./eslint-plugin-prettier');

/**
 * @type {Plugin}
 */
const plugin = {
  meta: prettier.meta,
  configs: {
    recommended: {
      plugins: {
        prettier,
      },
      rules: {
        'prettier/prettier': 'error',
        'arrow-body-style': 'off',
        'prefer-arrow-callback': 'off',
      },
    },
  },
  rules: prettier.rules,
};

module.exports = plugin;

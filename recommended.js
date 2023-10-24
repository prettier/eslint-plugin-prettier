'use strict';

const prettier = require('./eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = {
  prettierConfig,
  plugins: {
    prettier,
  },
  rules: {
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
};

'use strict';

const prettier = require('./eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

const plugin = {
  configs: {},
  rules: {
    ...prettier.rules,
  },
};

Object.assign(plugin.configs, {
  recommended: {
    plugins: {
      prettier: plugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...prettier.configs.recommended.rules,
    },
  },
});

module.exports = plugin;

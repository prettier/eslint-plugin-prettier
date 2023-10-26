'use strict';

const prettier = require('./eslint-plugin-prettier');

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
      ...prettier.configs.recommended.rules,
    },
  },
});

module.exports = plugin;

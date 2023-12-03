const eslintPluginPrettier = require('./eslint-plugin-prettier');

// This diverges from the legacy format recommended config, as it does not
// extend from the `eslint-config-prettier` ruleset. When using the flat config
// the consumer should add eslint-config-prettier to their own root config.
module.exports = {
  plugins: {
    prettier: eslintPluginPrettier,
  },
  rules: {
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
};

const { configs: eslintConfigs } = require('@eslint/js');
const eslintPluginN = require('eslint-plugin-n');
const eslintPluginEslintComments = require('@eslint-community/eslint-plugin-eslint-comments');
const eslintPluginEslintPluginRecommended = require('eslint-plugin-eslint-plugin/configs/recommended');
const eslintPluginMdx = require('eslint-plugin-mdx');
const eslintPluginPrettierRecommended = require('./recommended');

module.exports = [
  eslintConfigs.recommended,
  eslintPluginN.configs['flat/recommended'],
  // eslint-community/eslint-comments does not expose a reusable flat config,
  // so create one from its legacy config
  {
    plugins: {
      '@eslint-community/eslint-comments': eslintPluginEslintComments,
    },
    rules: eslintPluginEslintComments.configs.recommended.rules,
  },
  eslintPluginEslintPluginRecommended,
  eslintPluginMdx.flat,
  eslintPluginMdx.flatCodeBlocks,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'eslint-plugin/report-message-format': ['error', '^[^a-z].*\\.$'],
    },
  },
  // Global ignores
  // If a config block only contains an `ignores` key, then the globs are
  // ignored globally
  {
    ignores: [
      'CHANGELOG.md',
      '.github/ISSUE_TEMPLATE.md',
      'test/fixtures/**/*',
    ],
  },
];

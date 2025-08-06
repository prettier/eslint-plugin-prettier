import eslintJs from '@eslint/js';
import eslintPluginN from 'eslint-plugin-n';
import eslintPluginEslintCommentsConfigs from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslintPluginEslintPlugin from 'eslint-plugin-eslint-plugin';
import * as eslintPluginMdx from 'eslint-plugin-mdx';

import eslintPluginPrettierRecommended from './recommended.js';

export default [
  eslintJs.configs.recommended,
  eslintPluginN.configs['flat/recommended'],
  eslintPluginEslintCommentsConfigs.recommended,
  eslintPluginEslintPlugin.configs.recommended,
  eslintPluginMdx.flat,
  eslintPluginMdx.flatCodeBlocks,
  eslintPluginPrettierRecommended,
  { files: ['**/*.mjs'], languageOptions: { sourceType: 'module' } },
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

import { ESLint } from 'eslint';

declare const eslintPluginPrettier: ESLint.Plugin & {
  configs: {
    recommended: import('eslint').Linter.Config<
      import('eslint').Linter.RulesRecord
    >[];
  };
};

export = eslintPluginPrettier;

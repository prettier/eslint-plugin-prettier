/**
 * @file Runs `prettier` as an ESLint rule.
 * @author Andres Suarez
 */

// This test is optimized for debuggability.
// Please do not attempt to DRY this file or dynamically load the fixtures.

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import assert from 'node:assert';
import url from 'node:url';
import fs from 'node:fs';
import eslintPackage from 'eslint';
import eslintUnsupportedApi from 'eslint/use-at-your-own-risk';

import eslintPluginPrettier from '../eslint-plugin-prettier.js';
import recommendedConfig from '../recommended.js';
import htmlEslintParser from '@html-eslint/parser';
import eslintPluginMdx from 'eslint-plugin-mdx';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import eslintPluginPug from 'eslint-plugin-pug';
import vueEslintParser from 'vue-eslint-parser';
import * as eslintPluginGraphql from '@graphql-eslint/eslint-plugin';
import eslintMdx from 'eslint-mdx';

const rule = eslintPluginPrettier.rules.prettier;
const isEslint8 = Boolean(eslintUnsupportedApi.FlatRuleTester);
const RuleTester =
  eslintUnsupportedApi.FlatRuleTester ?? eslintPackage.RuleTester;
const ESLint = eslintUnsupportedApi.FlatESLint ?? eslintPackage.ESLint;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------
console.log({isEslint8})
const ruleTester = isEslint8
  ? // https://github.com/eslint/eslint/issues/19471
    // Fixed in ESLint 9, but still needed for ESLint 8 unfortunately
    new RuleTester({ ignores: ['!**/node_modules/'] })
  : new RuleTester();

ruleTester.run('prettier', rule, {
  valid: [
    // Correct style. Also proves that the plugin works if no filename is provided
    { code: `'';\n` },
    // Double quote from .prettierrc.
    { code: '"";\n', filename: getPrettierRcJsFilename('double-quote') },
    // Override .prettierrc from object option.
    {
      code: `var foo = {bar: 0};\n`,
      filename: getPrettierRcJsFilename('bracket-spacing'),
      options: [{ bracketSpacing: false }],
    },
    // Only use options from plugin, skipping .prettierrc
    {
      code: `var foo = {bar: 0};\n`,
      filename: getPrettierRcJsFilename('bracket-spacing'),
      options: [{ bracketSpacing: false }, { usePrettierrc: false }],
    },
    // Ignores filenames in .prettierignore
    {
      code: `("");\n`,
      filename: getPrettierRcJsFilename('single-quote', 'ignore-me.js'),
    },
    // Sets a default parser when it can't be inferred from the file extensions
    {
      code: `('');\n`,
      filename: getPrettierRcJsFilename('single-quote', 'dummy.qqq'),
    },
    // Overwrites the parser for file extensions prettier would try to format
    // with not the babylon parser
    // In the real world, eslint-plugin-markdown would transform file contents
    // into JS snippets that would get passed to ESLint
    {
      code: `('');\n`,
      filename: getPrettierRcJsFilename('single-quote', 'dummy.md'),
    },
    // Should ignore files from node_modules
    {
      code: 'a();;;;;;\n',
      filename: 'node_modules/dummy.js',
    },
  ],
  invalid: [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11-a',
    '11-b',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
  ].map(name => loadInvalidFixture(name)),
});

const vueRuleTester = new RuleTester({
  languageOptions: { parser: vueEslintParser },
});

vueRuleTester.run('vue', rule, {
  valid: [
    {
      code: `<template>\n  <div>HI</div>\n</template>\n<script>\n3;\n</script>\n`,
      filename: 'valid.vue',
    },
  ],
  invalid: [
    Object.assign(loadInvalidFixture('vue'), {
      filename: 'invalid.vue',
    }),
    Object.assign(loadInvalidFixture('vue-syntax-error'), {
      filename: 'syntax-error.vue',
    }),
  ],
});

const atGraphqlEslintRuleTester = new RuleTester({
  languageOptions: { parser: eslintPluginGraphql },
});

atGraphqlEslintRuleTester.run('@graphql-eslint/eslint-plugin', rule, {
  valid: [
    {
      code: `type Query {\n  foo: String!\n}\n`,
      filename: 'valid.graphql',
    },
  ],
  invalid: [
    Object.assign(loadInvalidFixture('graphql'), {
      filename: 'invalid.graphql',
    }),
  ],
});

// eslint-plugin-graphql handles literal graphql files by transforming graphql
// code with a processor, instead of using a parser. Unfortunately we cant
// specify custom processors in a RuleTester, so instead we have write test code
// that is the result of eslint-plugin-graphql's processing - this is the
// ESLintPluginGraphQLFile tagged template literal. See
// https://github.com/apollographql/eslint-plugin-graphql/blob/c465fedc8fea239ee1731ad4ec3ee1183a3cdddf/src/index.js#L404
// In the future if ESLint supports processors (https://github.com/eslint/rfcs/pull/31)
// we should be define a RuleTester like
// `newRuleTester({processor: require('eslint-plugin-graphql').processor['.graphql']})
// and then pass in pure graphql into the code value.
const eslintPluginGraphqlRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
    },
  },
});

eslintPluginGraphqlRuleTester.run('eslint-plugin-graphql', rule, {
  valid: [
    {
      code: 'ESLintPluginGraphQLFile`type Query {\n  foo: String!\n}`\n',
      filename: getPrettierRcJsFilename('no-semi', 'dummy.graphql'),
    },
  ],
  invalid: [],
});

runFixture('*.html', [
  [
    {
      column: 1,
      endColumn: 1,
      endLine: 5,
      fix: {
        range: [23, 31],
        text: '  <head> ',
      },
      line: 3,
      message: 'Replace `<head>⏎⏎` with `··<head>·`',
      messageId: 'replace',
      nodeType: null,
      ruleId: 'prettier/prettier',
      severity: 2,
    },
    {
      column: 1,
      endColumn: 1,
      endLine: 8,
      fix: {
        range: [39, 47],
        text: '  <body>',
      },
      line: 6,
      message: 'Replace `<body>⏎⏎` with `··<body>`',
      messageId: 'replace',
      nodeType: null,
      ruleId: 'prettier/prettier',
      severity: 2,
    },
  ],
]);

const mdxRuleTester = new RuleTester({
  languageOptions: {
    parser: eslintMdx,
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
  },
});

mdxRuleTester.run('eslint-plugin-mdx', rule, {
  valid: [
    {
      code: [
        "import React from 'react';",
        '',
        '<div>Hello World</div>',
        '',
      ].join('\n'),
      filename: 'valid.mdx',
    },
  ],
  invalid: [
    Object.assign(loadInvalidFixture('mdx'), {
      filename: 'invalid.mdx',
    }),
  ],
});

runFixture('*.md', [
  [
    {
      column: 27,
      endColumn: 27,
      endLine: 4,
      fix: {
        range: [43, 43],
        text: ';',
      },
      line: 4,
      message: 'Insert `;`',
      messageId: 'insert',
      nodeType: null,
      ruleId: 'prettier/prettier',
      severity: 2,
    },
  ],
]);

runFixture('*.mdx', [
  [
    {
      column: 33,
      endColumn: 33,
      endLine: 1,
      fix: {
        range: [32, 32],
        text: ';',
      },
      line: 1,
      message: 'Insert `;`',
      messageId: 'insert',
      nodeType: null,
      ruleId: 'prettier/prettier',
      severity: 2,
    },
    {
      column: 27,
      endColumn: 27,
      endLine: 6,
      fix: {
        range: [91, 91],
        text: ';',
      },
      line: 6,
      message: 'Insert `;`',
      messageId: 'insert',
      nodeType: null,
      ruleId: 'prettier/prettier',
      severity: 2,
    },
  ],
]);

/**
 * @see https://github.com/sveltejs/svelte/blob/226bf419f9b9b5f1a6da33bd6403dd70afe58b52/packages/svelte/package.json#L73
 */
const svelteUnsupported = +process.versions.node.split('.')[0] < 16;

runFixture(
  'eslint-plugin-svelte/*.svelte',
  [
    [
      {
        column: 1,
        endColumn: 11,
        endLine: 2,
        fix: {
          range: [9, 19],
          text: '  let name',
        },
        line: 2,
        message: 'Replace `let··name·` with `··let·name`',
        messageId: 'replace',
        nodeType: null,
        ruleId: 'prettier/prettier',
        severity: 2,
      },
      {
        column: 4,
        endColumn: 20,
        endLine: 5,
        fix: {
          range: [45, 61],
          text: '>Hello {name',
        },
        line: 5,
        message: 'Replace `·>·Hello·{·name·` with `>Hello·{name`',
        messageId: 'replace',
        nodeType: null,
        ruleId: 'prettier/prettier',
        severity: 2,
      },
    ],
  ],
  svelteUnsupported,
);

runFixture('*.pug', [
  [
    {
      column: 7,
      endColumn: 12,
      endLine: 2,
      fix: {
        range: [14, 19],
        text: '',
      },
      line: 2,
      message: 'Delete `;;;;;`',
      messageId: 'delete',
      nodeType: null,
      ruleId: 'prettier/prettier',
      severity: 2,
    },
  ],
]);

runFixture('invalid-prettierrc/*', [
  [
    {
      column: 1,
      fatal: true,
      line: 1,
      message:
        "Parsing error: 'import' and 'export' may appear only with 'sourceType: module'",
      nodeType: null,
      ruleId: null,
      severity: 2,
    },
  ],
  [
    {
      column: 1,
      endColumn: 20,
      endLine: 1,
      line: 1,
      message: 'Parsing error: Cannot use import statement outside a module',
      nodeType: 'Program',
      ruleId: 'prettier/prettier',
      severity: 2,
    },
  ],
]);

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

/**
 * Reads a fixture file and returns an "invalid" case for use by RuleTester.
 * The fixture format aims to reduce the pain of debugging offsets by keeping
 * the lines and columns of the test code as close to what the rule will report
 * as possible.
 *
 * @param {string} name - Fixture basename.
 * @returns {object} A {code, output, options, errors} test object.
 */
function loadInvalidFixture(name) {
  const filename = url.fileURLToPath(
    new URL(`./invalid/${name}.txt`, import.meta.url),
  );
  const src = fs.readFileSync(filename, 'utf8');
  const sections = src.split(/^[A-Z]+:\n/m).map(x => x.replace(/\n$/, ''));
  const item = {
    code: sections[1],
    output: sections[2],
    options: eval(sections[3]),
    errors: eval(sections[4]),
    filename: getPrettierRcJsFilename('double-quote', name + '.txt'),
  };

  if (sections.length >= 6) {
    item.filename = sections[5];
  }

  if (item.code === item.output) {
    item.output = null;
  }

  return item;
}

/**
 * Builds a dummy javascript file path to trick prettier into resolving a specific .prettierrc file.
 *
 * @param {string} dir - Prettierrc fixture basename.
 * @param {string} file
 * @returns {string} A javascript filename relative to the .prettierrc config.
 */
function getPrettierRcJsFilename(dir, file = 'dummy.js') {
  return url.fileURLToPath(
    new URL(`./prettierrc/${dir}/${file}`, import.meta.url),
  );
}

let eslint;

/**
 *
 * @param {string} pattern
 * @param {import('eslint').Linter.LintMessage[][]} asserts
 * @param {boolean} [skip]
 * @returns {Promise<void>}
 */
async function runFixture(pattern, asserts, skip) {
  if (!eslint) {
    eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          languageOptions: {
            parserOptions: {
              ecmaVersion: 'latest',
              ecmaFeatures: {
                jsx: true,
              },
              sourceType: 'module',
            },
          },
        },
        recommendedConfig,
        // `.prettierignore` will be used by default which is unexpected for these test fixtures
        {
          files: ['test/fixtures/**/*'],
          rules: {
            'prettier/prettier': [
              'error',
              {},
              {
                fileInfoOptions: {
                  ignorePath: '.eslintignore',
                },
              },
            ],
          },
        },
        {
          files: ['**/*.html'],
          languageOptions: { parser: htmlEslintParser },
        },
        eslintPluginMdx.flat,
        {
          files: ['*.{md,mdx}'],
          settings: {
            'mdx/code-block': true,
          },
        },
        {
          files: ['**/eslint-plugin-svelte3/*.named-blocks.svelte'],
          settings: {
            'svelte3/named-blocks': true,
          },
        },
        ...eslintPluginSvelte.configs.recommended.map(config => ({
          ...config,
          files: ['**/eslint-plugin-svelte/*.svelte'],
        })),
        {
          files: ['**/*.pug'],
          plugins: {
            pug: eslintPluginPug,
          },
        },
      ],
      ignore: false,
    });
  }

  if (skip) {
    return;
  }
  try {
    const results = await eslint.lintFiles([`test/fixtures/${pattern}`]);
    return assert.deepStrictEqual(
      results.map(({ messages }) => messages),
      asserts,
      pattern,
    );
  } catch (err) {
    console.error(err);
    // eslint-disable-next-line n/no-process-exit -- the fix is not correctly working
    process.exit(1);
  }
}

/**
 * @fileoverview Runs `prettier` as an ESLint rule.
 * @author Andres Suarez
 */

'use strict';

// This test is optimized for debuggability.
// Please do not attempt to DRY this file or dynamically load the fixtures.

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');

const eslintPluginPrettier = require('..');

const rule = eslintPluginPrettier.rules.prettier;
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run('prettier', rule, {
  valid: [
    // Correct style.
    { code: '"";\n' },
    // Single quote from .prettierrc.
    { code: `'';\n`, filename: getPrettierRcJsFilename('single-quote') },
    // Override .prettierrc from object option.
    {
      code: `var foo = {bar: 0};\n`,
      filename: getPrettierRcJsFilename('bracket-spacing'),
      options: [{ bracketSpacing: false }]
    },
    // Only use options from plugin, skipping .prettierrc
    {
      code: `var foo = {bar: 0};\n`,
      filename: getPrettierRcJsFilename('bracket-spacing'),
      options: [{ bracketSpacing: false }, { usePrettierrc: false }]
    },
    // Ignores filenames in .prettierignore
    {
      code: `("");\n`,
      filename: getPrettierRcJsFilename('single-quote', 'ignore-me.js')
    },
    // Sets a default parser when it can't be inferred from the file extensions
    {
      code: `('');\n`,
      filename: getPrettierRcJsFilename('single-quote', 'dummy.qqq')
    },
    // Overwrites the parser for file extensions prettier would try to format
    // with not the babylon parser
    // In the real world, eslint-plugin-markdown would transform file contents
    // into JS snippets that would get passed to ESLint
    {
      code: `('');\n`,
      filename: getPrettierRcJsFilename('single-quote', 'dummy.md')
    }
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
    '17'
  ].map(loadInvalidFixture)
});

const vueRuleTester = new RuleTester({
  parser: require.resolve('vue-eslint-parser')
});

vueRuleTester.run('prettier', rule, {
  valid: [
    {
      code: `<template>\n  <div>HI</div>\n</template>\n<script>\n3;\n</script>\n`,
      filename: 'valid.vue'
    }
  ],
  invalid: [
    Object.assign(loadInvalidFixture('vue'), {
      filename: 'invalid.vue'
    })
  ]
});

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

/**
 * Reads a fixture file and returns an "invalid" case for use by RuleTester.
 * The fixture format aims to reduce the pain of debugging offsets by keeping
 * the lines and columns of the test code as close to what the rule will report
 * as possible.
 * @param {string} name - Fixture basename.
 * @returns {Object} A {code, output, options, errors} test object.
 */
function loadInvalidFixture(name) {
  const filename = path.join(__dirname, 'invalid', name + '.txt');
  const src = fs.readFileSync(filename, 'utf8');
  const sections = src
    .split(/^[A-Z]+:\n/m)
    .map(x => x.replace(/(?=\n)\n$/, ''));
  const item = {
    code: sections[1],
    output: sections[2],
    options: eval(sections[3]), // eslint-disable-line no-eval
    errors: eval(sections[4]) // eslint-disable-line no-eval
  };
  return item;
}

/**
 * Builds a dummy javascript file path to trick prettier into resolving a specific .prettierrc file.
 * @param {string} dir - Prettierrc fixture basename.
 * @returns {string} A javascript filename relative to the .prettierrc config.
 */
function getPrettierRcJsFilename(dir, file = 'dummy.js') {
  return path.resolve(__dirname, `./prettierrc/${dir}/${file}`);
}

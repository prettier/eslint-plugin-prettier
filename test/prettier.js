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

const rule = require('..').rules.prettier;
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run('prettier', rule, {
  valid: [
    // Correct style.
    { code: '"";\n' },
    // No pragma = No prettier check.
    { code: '""\n', options: [null, '@format'] },
    // Facebook style uses single quotes.
    { code: `'';\n`, options: ['fb'] },
    // Facebook style but missing pragma.
    { code: `"";\n`, options: ['fb', '@format'] },
    // Facebook style with pragma.
    { code: `/** @format */\n'';\n`, options: ['fb', '@format'] }
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
    '11-c',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18'
  ].map(loadInvalidFixture)
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

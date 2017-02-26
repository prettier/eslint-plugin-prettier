/**
 * @fileoverview runs `prettier` as an eslint rule
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prettier');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------
const ruleTester = new RuleTester();

ruleTester.run('prettier', rule, {
  valid: [
    'foo(bar);\n',
    'foo("bar");\n',
    { code: "foo('bar');\n", options: [{ singleQuote: true }] }
  ],
  invalid: [
    {
      code: 'foo(bar  )',
      output: 'foo(bar);\n',
      errors: [
        {
          line: 1,
          column: 8,
          message: "Follow `prettier` formatting (expected ')' but found ' ')."
        }
      ]
    },
    {
      code: 'foo(bar);',
      output: 'foo(bar);\n',
      errors: [
        {
          line: 1,
          column: 10,
          message: "Follow `prettier` formatting (expected '\\n' but found 'EOF')."
        }
      ]
    },
    {
      code: 'foo(bar);\n\n',
      output: 'foo(bar);\n',
      errors: [
        {
          line: 2,
          column: 1,
          message: "Follow `prettier` formatting (expected 'EOF' but found '\\n')."
        }
      ]
    }
  ]
});

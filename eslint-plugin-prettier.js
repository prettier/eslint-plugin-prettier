/**
 * @fileoverview Runs `prettier` as an ESLint rule.
 * @author Andres Suarez
 */

'use strict';

// ------------------------------------------------------------------------------
//  Requirements
// ------------------------------------------------------------------------------

const docblock = require('jest-docblock');
const utils = require('./utils');

// ------------------------------------------------------------------------------
//  Constants
// ------------------------------------------------------------------------------

// Preferred Facebook style.
const FB_PRETTIER_OPTIONS = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsxBracketSameLine: true,
  parser: 'flow'
};

// ------------------------------------------------------------------------------
//  Privates
// ------------------------------------------------------------------------------

// Lazily-loaded Prettier.
let prettier;

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

/**
 * Gets the location of a given index in the source code for a given context.
 * @param {RuleContext} context - The ESLint rule context.
 * @param {number} index - An index in the source code.
 * @returns {Object} An object containing numeric `line` and `column` keys.
 */
function getLocFromIndex(context, index) {
  // If `sourceCode.getLocFromIndex` is available from ESLint, use it - added
  // in ESLint 3.16.0.
  const sourceCode = context.getSourceCode();
  if (typeof sourceCode.getLocFromIndex === 'function') {
    return sourceCode.getLocFromIndex(index);
  }
  const text = sourceCode.getText();
  if (typeof index !== 'number') {
    throw new TypeError('Expected `index` to be a number.');
  }
  if (index < 0 || index > text.length) {
    throw new RangeError('Index out of range.');
  }
  // Loosely based on
  // https://github.com/eslint/eslint/blob/18a519fa/lib/ast-utils.js#L408-L438
  const lineEndingPattern = /\r\n|[\r\n\u2028\u2029]/g;
  let offset = 0;
  let line = 0;
  let match;
  while ((match = lineEndingPattern.exec(text))) {
    const next = match.index + match[0].length;
    if (index < next) {
      break;
    }
    line++;
    offset = next;
  }
  return {
    line: line + 1,
    column: index - offset
  };
}

// ------------------------------------------------------------------------------
//  Rule Definition
// ------------------------------------------------------------------------------

/**
 * Reports an "Insert ..." issue where text must be inserted.
 * @param {RuleContext} context - The ESLint rule context.
 * @param {number} offset - The source offset where to insert text.
 * @param {string} text - The text to be inserted.
 * @returns {void}
 */
function reportInsert(context, offset, text) {
  const pos = getLocFromIndex(context, offset);
  const range = [offset, offset];
  context.report({
    message: 'Insert `{{ code }}`',
    data: { code: utils.showInvisibles(text) },
    loc: { start: pos, end: pos },
    fix(fixer) {
      return fixer.insertTextAfterRange(range, text);
    }
  });
}

/**
 * Reports a "Delete ..." issue where text must be deleted.
 * @param {RuleContext} context - The ESLint rule context.
 * @param {number} offset - The source offset where to delete text.
 * @param {string} text - The text to be deleted.
 * @returns {void}
 */
function reportDelete(context, offset, text) {
  const start = getLocFromIndex(context, offset);
  const end = getLocFromIndex(context, offset + text.length);
  const range = [offset, offset + text.length];
  context.report({
    message: 'Delete `{{ code }}`',
    data: { code: utils.showInvisibles(text) },
    loc: { start, end },
    fix(fixer) {
      return fixer.removeRange(range);
    }
  });
}

/**
 * Reports a "Replace ... with ..." issue where text must be replaced.
 * @param {RuleContext} context - The ESLint rule context.
 * @param {number} offset - The source offset where to replace deleted text
 with inserted text.
 * @param {string} deleteText - The text to be deleted.
 * @param {string} insertText - The text to be inserted.
 * @returns {void}
 */
function reportReplace(context, offset, deleteText, insertText) {
  const start = getLocFromIndex(context, offset);
  const end = getLocFromIndex(context, offset + deleteText.length);
  const range = [offset, offset + deleteText.length];
  context.report({
    message: 'Replace `{{ deleteCode }}` with `{{ insertCode }}`',
    data: {
      deleteCode: utils.showInvisibles(deleteText),
      insertCode: utils.showInvisibles(insertText)
    },
    loc: { start, end },
    fix(fixer) {
      return fixer.replaceTextRange(range, insertText);
    }
  });
}

// ------------------------------------------------------------------------------
//  Module Definition
// ------------------------------------------------------------------------------

module.exports.rules = {
  prettier: {
    meta: {
      fixable: 'code',
      schema: [
        // Prettier options:
        {
          anyOf: [
            { enum: [null, 'fb'] },
            { type: 'object', properties: {}, additionalProperties: true }
          ]
        },
        // Pragma:
        { type: 'string', pattern: '^@\\w+$' }
      ]
    },
    create(context) {
      const prettierOptions = context.options[0] === 'fb'
        ? FB_PRETTIER_OPTIONS
        : context.options[0];

      const pragma = context.options[1]
        ? context.options[1].slice(1) // Remove leading @
        : null;

      const sourceCode = context.getSourceCode();
      const source = sourceCode.text;

      // The pragma is only valid if it is found in a block comment at the very
      // start of the file.
      if (pragma) {
        // ESLint 3.x reports the shebang as a "Line" node, while ESLint 4.x
        // reports it as a "Shebang" node. This works for both versions:
        const hasShebang = source.startsWith('#!');
        const allComments = sourceCode.getAllComments();
        const firstComment = hasShebang ? allComments[1] : allComments[0];
        if (
          !(firstComment &&
            firstComment.type === 'Block' &&
            firstComment.loc.start.line === (hasShebang ? 2 : 1) &&
            firstComment.loc.start.column === 0)
        ) {
          return {};
        }
        const parsed = docblock.parse(firstComment.value);
        if (parsed[pragma] !== '') {
          return {};
        }
      }

      return {
        Program() {
          if (!prettier) {
            // Prettier is expensive to load, so only load it if needed.
            prettier = require('prettier');
          }
          const prettierSource = prettier.format(source, prettierOptions);
          if (source !== prettierSource) {
            utils.reportDifferences(source, prettierSource, {
              reportReplace: reportReplace.bind(null, context),
              reportDelete: reportDelete.bind(null, context),
              reportInsert: reportInsert.bind(null, context)
            });
          }
        }
      };
    }
  }
};

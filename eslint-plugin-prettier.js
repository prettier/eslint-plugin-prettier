/**
 * @fileoverview Runs `prettier` as an ESLint rule.
 * @author Andres Suarez
 */

'use strict';

// ------------------------------------------------------------------------------
//  Requirements
// ------------------------------------------------------------------------------

const diff = require('fast-diff');
const docblock = require('jest-docblock');

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

const LINE_ENDING_RE = /\r\n|[\r\n\u2028\u2029]/;

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

/**
 * Converts invisible characters to a commonly recognizable visible form.
 * @param {string} str - The string with invisibles to convert.
 * @returns {string} The converted string.
 */
function showInvisibles(str) {
  let ret = '';
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case ' ':
        ret += '·'; // Middle Dot, \u00B7
        break;
      case '\n':
        ret += '⏎'; // Return Symbol, \u23ce
        break;
      case '\t':
        ret += '↹'; // Left Arrow To Bar Over Right Arrow To Bar, \u21b9
        break;
      default:
        ret += str[i];
        break;
    }
  }
  return ret;
}

// ------------------------------------------------------------------------------
//  Rule Definition
// ------------------------------------------------------------------------------

/**
 * Reports issues where the context's source code differs from the Prettier
 formatted version.
 * @param {string} source - The original source.
 * @param {string} prettierSource - The Prettier formatted source.
 * @param {Object} reporters - Reporters to report linter failure
 * @param {Function} reporters.reportReplace - A function takes offset, deleteText, insertText and message
 * @param {Function} reporters.reportInsert - A function takes offset, insertText and message
 * @param {Function} reporters.reportDelete - A function takes offset, deleteText and message
 * @returns {void}
 */
function reportDifferences(source, prettierSource, reporters) {
  // fast-diff returns the differences between two texts as a series of
  // INSERT, DELETE or EQUAL operations. The results occur only in these
  // sequences:
  //           /-> INSERT -> EQUAL
  //    EQUAL |           /-> EQUAL
  //           \-> DELETE |
  //                      \-> INSERT -> EQUAL
  // Instead of reporting issues at each INSERT or DELETE, certain sequences
  // are batched together and are reported as a friendlier "replace" operation:
  // - A DELETE immediately followed by an INSERT.
  // - Any number of INSERTs and DELETEs where the joining EQUAL of one's end
  // and another's beginning does not have line endings (i.e. issues that occur
  // on contiguous lines).

  const results = diff(source, prettierSource);

  const batch = [];
  let offset = 0; // NOTE: INSERT never advances the offset.
  while (results.length) {
    const result = results.shift();
    const op = result[0];
    const text = result[1];
    switch (op) {
      case diff.INSERT:
      case diff.DELETE:
        batch.push(result);
        break;
      case diff.EQUAL:
        if (results.length) {
          if (batch.length) {
            if (LINE_ENDING_RE.test(text)) {
              flush();
              offset += text.length;
            } else {
              batch.push(result);
            }
          } else {
            offset += text.length;
          }
        }
        break;
      default:
        throw new Error(`Unexpected fast-diff operation "${op}"`);
    }
    if (batch.length && !results.length) {
      flush();
    }
  }

  function flush() {
    let aheadDeleteText = '';
    let aheadInsertText = '';
    while (batch.length) {
      const next = batch.shift();
      const op = next[0];
      const text = next[1];
      switch (op) {
        case diff.INSERT:
          aheadInsertText += text;
          break;
        case diff.DELETE:
          aheadDeleteText += text;
          break;
        case diff.EQUAL:
          aheadDeleteText += text;
          aheadInsertText += text;
          break;
      }
    }
    if (aheadDeleteText && aheadInsertText) {
      reporters.reportReplace(
        offset,
        aheadDeleteText,
        aheadInsertText,
        `Replace \`${showInvisibles(aheadDeleteText)}\` with \`${showInvisibles(aheadInsertText)}\``
      );
    } else if (!aheadDeleteText && aheadInsertText) {
      reporters.reportInsert(
        offset,
        aheadInsertText,
        `Insert \`${showInvisibles(aheadInsertText)}\``
      );
    } else if (aheadDeleteText && !aheadInsertText) {
      reporters.reportDelete(
        offset,
        aheadDeleteText,
        `Delete \`${showInvisibles(aheadDeleteText)}\``
      );
    }
    offset += aheadDeleteText.length;
  }
}

/**
 * Reports an "Insert ..." issue where text must be inserted.
 * @param {RuleContext} context - The ESLint rule context.
 * @param {number} offset - The source offset where to insert text.
 * @param {string} text - The text to be inserted.
 * @param {string} message - The message to be displayed.
 * @returns {void}
 */
function reportInsert(context, offset, text, message) {
  const pos = getLocFromIndex(context, offset);
  const range = [offset, offset];
  context.report({
    message,
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
 * @param {string} message - The message to be displayed.
 * @returns {void}
 */
function reportDelete(context, offset, text, message) {
  const start = getLocFromIndex(context, offset);
  const end = getLocFromIndex(context, offset + text.length);
  const range = [offset, offset + text.length];
  context.report({
    message,
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
 * @param {string} message - The message to be displayed.
 * @returns {void}
 */
function reportReplace(context, offset, deleteText, insertText, message) {
  const start = getLocFromIndex(context, offset);
  const end = getLocFromIndex(context, offset + deleteText.length);
  const range = [offset, offset + deleteText.length];
  context.report({
    message,
    loc: { start, end },
    fix(fixer) {
      return fixer.replaceTextRange(range, insertText);
    }
  });
}

// ------------------------------------------------------------------------------
//  Module Definition
// ------------------------------------------------------------------------------

module.exports = {
  showInvisibles,
  reportDifferences,
  rules: {
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
              reportDifferences(source, prettierSource, {
                reportReplace: reportReplace.bind(undefined, context),
                reportInsert: reportInsert.bind(undefined, context),
                reportDelete: reportDelete.bind(undefined, context)
              });
            }
          }
        };
      }
    }
  }
};

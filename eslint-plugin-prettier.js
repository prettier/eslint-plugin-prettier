/**
 * @fileoverview Runs `prettier` as an ESLint rule.
 * @author Andres Suarez
 */

'use strict';

// ------------------------------------------------------------------------------
//  Requirements
// ------------------------------------------------------------------------------

const diff = require('fast-diff');

// ------------------------------------------------------------------------------
//  Constants
// ------------------------------------------------------------------------------

const LINE_ENDING_RE = /\r\n|[\r\n\u2028\u2029]/;

const OPERATION_INSERT = 'insert';
const OPERATION_DELETE = 'delete';
const OPERATION_REPLACE = 'replace';

// ------------------------------------------------------------------------------
//  Privates
// ------------------------------------------------------------------------------

// Lazily-loaded Prettier.
let prettier;

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

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
      case '\r':
        ret += '␍'; // Carriage Return Symbol, \u240D
        break;
      default:
        ret += str[i];
        break;
    }
  }
  return ret;
}

/**
 * Generate results for differences between source code and formatted version.
 * @param {string} source - The original source.
 * @param {string} prettierSource - The Prettier formatted source.
 * @returns {Array} - An array contains { operation, offset, insertText, deleteText }
 */
function generateDifferences(source, prettierSource) {
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
  const differences = [];

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

  return differences;

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
      differences.push({
        offset,
        operation: OPERATION_REPLACE,
        insertText: aheadInsertText,
        deleteText: aheadDeleteText
      });
    } else if (!aheadDeleteText && aheadInsertText) {
      differences.push({
        offset,
        operation: OPERATION_INSERT,
        insertText: aheadInsertText
      });
    } else if (aheadDeleteText && !aheadInsertText) {
      differences.push({
        offset,
        operation: OPERATION_DELETE,
        deleteText: aheadDeleteText
      });
    }
    offset += aheadDeleteText.length;
  }
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
  const pos = context.getSourceCode().getLocFromIndex(offset);
  const range = [offset, offset];
  context.report({
    message: 'Insert `{{ code }}`',
    data: { code: showInvisibles(text) },
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
  const start = context.getSourceCode().getLocFromIndex(offset);
  const end = context.getSourceCode().getLocFromIndex(offset + text.length);
  const range = [offset, offset + text.length];
  context.report({
    message: 'Delete `{{ code }}`',
    data: { code: showInvisibles(text) },
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
  const start = context.getSourceCode().getLocFromIndex(offset);
  const end = context
    .getSourceCode()
    .getLocFromIndex(offset + deleteText.length);
  const range = [offset, offset + deleteText.length];
  context.report({
    message: 'Replace `{{ deleteCode }}` with `{{ insertCode }}`',
    data: {
      deleteCode: showInvisibles(deleteText),
      insertCode: showInvisibles(insertText)
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

module.exports = {
  showInvisibles,
  generateDifferences,
  configs: {
    recommended: {
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error'
      }
    }
  },
  rules: {
    prettier: {
      meta: {
        docs: {
          url: 'https://github.com/prettier/eslint-plugin-prettier#options'
        },
        fixable: 'code',
        schema: [
          // Prettier options:
          {
            type: 'object',
            properties: {},
            additionalProperties: true
          },
          {
            type: 'object',
            properties: {
              usePrettierrc: { type: 'boolean' }
            },
            additionalProperties: true
          }
        ]
      },
      create(context) {
        const usePrettierrc =
          !context.options[1] || context.options[1].usePrettierrc !== false;
        const sourceCode = context.getSourceCode();
        const filepath = context.getFilename();
        const source = sourceCode.text;

        if (prettier && prettier.clearConfigCache) {
          prettier.clearConfigCache();
        }

        return {
          Program() {
            if (!prettier) {
              // Prettier is expensive to load, so only load it if needed.
              prettier = require('prettier');
            }

            const eslintPrettierOptions = context.options[0] || {};

            const prettierRcOptions = usePrettierrc
              ? prettier.resolveConfig.sync(filepath, {
                  editorconfig: true
                })
              : null;

            const prettierFileInfo = prettier.getFileInfo.sync(filepath, {
              ignorePath: '.prettierignore'
            });

            // Skip if file is ignored using a .prettierignore file
            if (prettierFileInfo.ignored) {
              return;
            }

            const initialOptions = {};

            // ESLint suppports processors that let you extract and lint JS
            // fragments within a non-JS language. In the cases where prettier
            // supports the same language as a processor, we want to process
            // the provided source code as javascript (as ESLint provides the
            // rules with fragments of JS) instead of guessing the parser
            // based off the filename. Otherwise, for instance, on a .md file we
            // end up trying to run prettier over a fragment of JS using the
            // markdown parser, which throws an error.
            // If we can't infer the parser from from the filename, either
            // because no filename was provided or because there is no parser
            // found for the filename, use javascript.
            // This is added to the options first, so that
            // prettierRcOptions and eslintPrettierOptions can still override
            // the parser.
            //
            // `parserBlocklist` should contain the list of prettier parser
            // names for file types where:
            // * Prettier supports parsing the file type
            // * There is an ESLint processor that extracts JavaScript snippets
            //   from the file type.
            const parserBlocklist = [null, 'graphql', 'markdown', 'html'];
            if (
              parserBlocklist.indexOf(prettierFileInfo.inferredParser) !== -1
            ) {
              initialOptions.parser = 'babylon';
            }

            const prettierOptions = Object.assign(
              {},
              initialOptions,
              prettierRcOptions,
              eslintPrettierOptions,
              { filepath }
            );

            const prettierSource = prettier.format(source, prettierOptions);
            if (source !== prettierSource) {
              const differences = generateDifferences(source, prettierSource);

              differences.forEach(difference => {
                switch (difference.operation) {
                  case OPERATION_INSERT:
                    reportInsert(
                      context,
                      difference.offset,
                      difference.insertText
                    );
                    break;
                  case OPERATION_DELETE:
                    reportDelete(
                      context,
                      difference.offset,
                      difference.deleteText
                    );
                    break;
                  case OPERATION_REPLACE:
                    reportReplace(
                      context,
                      difference.offset,
                      difference.deleteText,
                      difference.insertText
                    );
                    break;
                }
              });
            }
          }
        };
      }
    }
  }
};

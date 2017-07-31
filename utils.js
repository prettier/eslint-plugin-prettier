'use strict';

const diff = require('fast-diff');

const LINE_ENDING_RE = /\r\n|[\r\n\u2028\u2029]/;

/**
 * Converts invisible characters to a commonly recognizable visible form.
 * @param {string} str - The string with invisibles to convert.
 * @returns {string} The converted string.
 */
exports.showInvisibles = function(str) {
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
};

/**
 * Reports issues where the context's source code differs from the Prettier
 formatted version.
 * @param {string} source - The source code
 * @param {string} formatted - The Prettier formatted source.
 * @param reporters
 * @returns {void}
 */
exports.reportDifferences = function(source, formatted, reporters) {
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

  const results = diff(source, formatted);

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
        `Replace \`${exports.showInvisibles(aheadDeleteText)}\` with \`${exports.showInvisibles(aheadInsertText)}\``
      );
    } else if (!aheadDeleteText && aheadInsertText) {
      reporters.reportInsert(
        offset,
        aheadInsertText,
        `Insert \`${exports.showInvisibles(aheadInsertText)}\``
      );
    } else if (aheadDeleteText && !aheadInsertText) {
      reporters.reportDelete(
        offset,
        aheadDeleteText,
        `Delete \`${exports.showInvisibles(aheadInsertText)}\``
      );
    }
    offset += aheadDeleteText.length;
  }
};

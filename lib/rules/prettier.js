/**
 * @fileoverview runs `prettier` as an eslint rule
 * @author Teddy Katz
 */

'use strict';

const util = require('util');
const prettier = require('prettier');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = {
  meta: { fixable: 'code', schema: [{ type: 'object' }] },
  create(context) {
    const sourceCode = context.getSourceCode();

    /**
     * Gets the location of a given index in the source code
     * @param {number} index An index in the source code
     * @returns {object} An object containing numberic `line` and `column` keys
     */
    function getLocation(index) {
      // If sourceCode.getLocFromIndex is available from eslint, use it.
      // Otherwise, use the private version from eslint/lib/ast-utils.

      return sourceCode.getLocFromIndex
        ? sourceCode.getLocFromIndex(index)
        : require('eslint/lib/ast-utils').getLocationFromRangeIndex(
            sourceCode,
            index
          );
    }

    return {
      Program() {
        // This isn't really very performant (prettier needs to reparse the text).
        // However, I don't think it's possible to run `prettier` on an ESTree AST.
        const desiredText = prettier.format(
          sourceCode.text,
          context.options[0]
        );

        if (sourceCode.text !== desiredText) {
          // Find the first character that differs
          const firstBadIndex = Array.from(desiredText)
            .findIndex((char, index) => char !== sourceCode.text[index]);
          const expectedChar = firstBadIndex === -1
            ? 'EOF'
            : desiredText[firstBadIndex];
          const foundChar = firstBadIndex >= sourceCode.text.length
            ? 'EOF'
            : firstBadIndex === -1
                ? sourceCode.text[desiredText.length]
                : sourceCode.text[firstBadIndex];

          context.report({
            loc: getLocation(
              firstBadIndex === -1 ? desiredText.length : firstBadIndex
            ),
            message: 'Follow `prettier` formatting (expected {{expectedChar}} but found {{foundChar}}).',
            data: {
              expectedChar: util.inspect(expectedChar),
              foundChar: util.inspect(foundChar)
            },
            fix: fixer =>
              fixer.replaceTextRange([0, sourceCode.text.length], desiredText)
          });
        }
      }
    };
  }
};
